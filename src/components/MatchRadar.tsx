import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Team = "barca" | "madrid";
type Dot = { id: string; team: Team; x: number; y: number };

function clamp(v: number, min = 0.03, max = 0.97) {
  return Math.max(min, Math.min(max, v));
}
function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}
function vecToward(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  return { ux: dx / d, uy: dy / d, dist: d };
}

// ✅ Safe value reader for new Animated types
function getVal(v: Animated.Value): number {
  const anyV = v as any;
  return (
    (typeof anyV.getNumericValue === "function"
      ? anyV.getNumericValue()
      : undefined) ??
    (typeof anyV.__getValue === "function" ? anyV.__getValue() : undefined) ??
    0
  );
}

function createInitialDots(): Dot[] {
  const barca: Dot[] = [
    { id: "b_gk", team: "barca", x: 0.1, y: 0.5 },
    { id: "b1", team: "barca", x: 0.22, y: 0.2 },
    { id: "b2", team: "barca", x: 0.22, y: 0.4 },
    { id: "b3", team: "barca", x: 0.22, y: 0.6 },
    { id: "b4", team: "barca", x: 0.22, y: 0.8 },
    { id: "b5", team: "barca", x: 0.42, y: 0.28 },
    { id: "b6", team: "barca", x: 0.42, y: 0.5 },
    { id: "b7", team: "barca", x: 0.42, y: 0.72 },
    { id: "b8", team: "barca", x: 0.62, y: 0.3 },
    { id: "b9", team: "barca", x: 0.62, y: 0.7 },
    { id: "b10", team: "barca", x: 0.78, y: 0.5 },
  ];

  const madrid: Dot[] = [
    { id: "m_gk", team: "madrid", x: 0.9, y: 0.5 },
    { id: "m1", team: "madrid", x: 0.78, y: 0.2 },
    { id: "m2", team: "madrid", x: 0.78, y: 0.4 },
    { id: "m3", team: "madrid", x: 0.78, y: 0.6 },
    { id: "m4", team: "madrid", x: 0.78, y: 0.8 },
    { id: "m5", team: "madrid", x: 0.58, y: 0.28 },
    { id: "m6", team: "madrid", x: 0.58, y: 0.5 },
    { id: "m7", team: "madrid", x: 0.58, y: 0.72 },
    { id: "m8", team: "madrid", x: 0.38, y: 0.3 },
    { id: "m9", team: "madrid", x: 0.38, y: 0.7 },
    { id: "m10", team: "madrid", x: 0.22, y: 0.5 },
  ];

  return [...barca, ...madrid];
}

type Possession = {
  team: Team;
  playerId: string;
  untilTs: number;
};

export default function MatchRadar() {
  const dots = useMemo(() => createInitialDots(), []);

  // ✅ Create animated map synchronously (prevents undefined on first render)
  const anim = useMemo(() => {
    const m = new Map<string, { x: Animated.Value; y: Animated.Value }>();
    dots.forEach((d) => {
      m.set(d.id, { x: new Animated.Value(d.x), y: new Animated.Value(d.y) });
    });
    return m;
  }, [dots]);

  // Ball (normalized 0..1)
  const ballX = useRef(new Animated.Value(0.52)).current;
  const ballY = useRef(new Animated.Value(0.5)).current;

  // Overlay state
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState({ barca: 0, madrid: 0 });

  const possessionRef = useRef<Possession>({
    team: "barca",
    playerId: "b6",
    untilTs: Date.now() + 2500,
  });

  // Timer (match clock)
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Helper: get current player position
  const getPos = (id: string) => {
    const v = anim.get(id);
    if (!v) return { x: 0.5, y: 0.5 };
    return { x: getVal(v.x), y: getVal(v.y) };
  };

  // Helper: pick a pass target from same team
  const pickPassTarget = (team: Team, fromId: string) => {
    const from = getPos(fromId);

    const candidates = dots
      .filter(
        (d) => d.team === team && d.id !== fromId && !d.id.endsWith("_gk"),
      )
      .map((d) => {
        const p = getPos(d.id);
        const dTo = dist(from.x, from.y, p.x, p.y);
        return { id: d.id, dTo };
      });

    candidates.sort((a, b) => a.dTo - b.dTo);

    const medium = candidates.filter((c) => c.dTo >= 0.12 && c.dTo <= 0.35);
    const pool = medium.length ? medium : candidates;

    if (!pool.length) return fromId;

    const pick = pool[Math.floor(rand(0, Math.min(5, pool.length)))];
    return pick.id;
  };

  // Helper: check for interception near ball
  const maybeInterception = (
    teamInPossession: Team,
    bx: number,
    by: number,
  ) => {
    const opponent: Team = teamInPossession === "barca" ? "madrid" : "barca";

    let closestOpp = "";
    let closestD = Infinity;

    dots.forEach((d) => {
      if (d.team !== opponent) return;
      const p = getPos(d.id);
      const dBall = dist(p.x, p.y, bx, by);
      if (dBall < closestD) {
        closestD = dBall;
        closestOpp = d.id;
      }
    });

    if (closestD < 0.07 && Math.random() < 0.35) {
      possessionRef.current = {
        team: opponent,
        playerId: closestOpp,
        untilTs: Date.now() + 1800,
      };
      return true;
    }

    return false;
  };

  // Simulation loop
  useEffect(() => {
    const tickMs = 650;

    const timer = setInterval(() => {
      const now = Date.now();
      const pos = possessionRef.current;

      const { x: holderX, y: holderY } = getPos(pos.playerId);

      const animations: Animated.CompositeAnimation[] = [];

      let nextBallX = holderX;
      let nextBallY = holderY;

      if (now >= pos.untilTs) {
        const targetId = pickPassTarget(pos.team, pos.playerId);
        const t = getPos(targetId);

        nextBallX = clamp(t.x + rand(-0.01, 0.01));
        nextBallY = clamp(t.y + rand(-0.01, 0.01));

        possessionRef.current = {
          team: pos.team,
          playerId: targetId,
          untilTs: now + Math.floor(rand(1800, 3200)),
        };
      } else {
        nextBallX = clamp(holderX + rand(-0.015, 0.015));
        nextBallY = clamp(holderY + rand(-0.015, 0.015));
      }

      maybeInterception(possessionRef.current.team, nextBallX, nextBallY);

      animations.push(
        Animated.timing(ballX, {
          toValue: nextBallX,
          duration: tickMs,
          useNativeDriver: false,
        }),
      );
      animations.push(
        Animated.timing(ballY, {
          toValue: nextBallY,
          duration: tickMs,
          useNativeDriver: false,
        }),
      );

      const teamWithBall = possessionRef.current.team;
      const nearRightGoal =
        nextBallX > 0.93 && nextBallY > 0.38 && nextBallY < 0.62;
      const nearLeftGoal =
        nextBallX < 0.07 && nextBallY > 0.38 && nextBallY < 0.62;

      if (
        (teamWithBall === "barca" && nearRightGoal && Math.random() < 0.1) ||
        (teamWithBall === "madrid" && nearLeftGoal && Math.random() < 0.1)
      ) {
        setScore((s) => ({ ...s, [teamWithBall]: s[teamWithBall] + 1 }));

        const other: Team = teamWithBall === "barca" ? "madrid" : "barca";
        const kickoffId = other === "barca" ? "b6" : "m6";

        possessionRef.current = {
          team: other,
          playerId: kickoffId,
          untilTs: now + 2200,
        };

        animations.push(
          Animated.timing(ballX, {
            toValue: 0.5,
            duration: 400,
            useNativeDriver: false,
          }),
        );
        animations.push(
          Animated.timing(ballY, {
            toValue: 0.5,
            duration: 400,
            useNativeDriver: false,
          }),
        );
      }

      const bx = nextBallX;
      const by = nextBallY;

      dots.forEach((d) => {
        const v = anim.get(d.id);
        if (!v) return;

        const px = getVal(v.x);
        const py = getVal(v.y);

        const { ux, uy } = vecToward(px, py, bx, by);

        const isGK = d.id.endsWith("_gk");
        const isHolder = d.id === possessionRef.current.playerId;

        const jitterX = rand(-0.02, 0.02);
        const jitterY = rand(-0.02, 0.02);

        let chase = 0.03;
        if (isGK) chase = 0.01;

        if (d.team === possessionRef.current.team) {
          chase = isHolder ? 0.025 : 0.02;
        } else {
          chase = isGK ? 0.01 : 0.045;
        }

        const shapeBias = d.team === "barca" ? -0.006 : 0.006;

        const attackBias =
          d.team === possessionRef.current.team
            ? d.team === "barca"
              ? 0.01
              : -0.01
            : 0;

        const nextX = clamp(px + ux * chase + jitterX + shapeBias + attackBias);
        const nextY = clamp(py + uy * chase + jitterY);

        animations.push(
          Animated.timing(v.x, {
            toValue: nextX,
            duration: tickMs,
            useNativeDriver: false,
          }),
        );
        animations.push(
          Animated.timing(v.y, {
            toValue: nextY,
            duration: tickMs,
            useNativeDriver: false,
          }),
        );
      });

      Animated.parallel(animations).start();
    }, tickMs);

    return () => clearInterval(timer);
  }, [dots, anim, ballX, ballY]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pos = possessionRef.current;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Match Simulation (Radar)</Text>

      <View style={styles.pitch}>
        <View style={styles.overlayTop}>
          <Text style={styles.overlayText}>
            BAR {score.barca} - {score.madrid} RMA
          </Text>
          <Text style={styles.overlayText}>
            {mm}:{ss}
          </Text>
        </View>

        <View style={styles.overlayBottom}>
          <View
            style={[
              styles.posBadge,
              pos.team === "barca" ? styles.posBarca : styles.posMadrid,
            ]}
          >
            <Text style={styles.posText}>
              Possession: {pos.team === "barca" ? "Barcelona" : "Real Madrid"}
            </Text>
          </View>
        </View>

        <View style={styles.centerLine} />
        <View style={styles.centerCircle} />

        <Animated.View
          style={[
            styles.ball,
            {
              left: ballX.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              top: ballY.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              transform: [{ translateX: -6 }, { translateY: -6 }],
            },
          ]}
        />

        {dots.map((d) => {
          const v = anim.get(d.id);
          if (!v) return null; // ✅ prevents crash

          const isHolder = d.id === possessionRef.current.playerId;

          return (
            <Animated.View
              key={d.id}
              style={[
                styles.dot,
                d.team === "barca" ? styles.dotBarca : styles.dotMadrid,
                d.id.endsWith("_gk") && styles.dotGK,
                isHolder && styles.dotHolder,
                {
                  left: v.x.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  top: v.y.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  transform: [{ translateX: -8 }, { translateY: -8 }],
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={[styles.legendDot, styles.dotBarca]} />
        <Text style={styles.legendText}>Barcelona</Text>

        <View style={{ width: 14 }} />

        <View style={[styles.legendDot, styles.dotMadrid]} />
        <Text style={styles.legendText}>Real Madrid</Text>

        <View style={{ width: 14 }} />

        <View style={styles.legendBall} />
        <Text style={styles.legendText}>Ball</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 14 },
  title: { fontSize: 16, fontWeight: "800", marginBottom: 10 },

  pitch: {
    width: "100%",
    aspectRatio: 105 / 68,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(20,120,60,1)",
    overflow: "hidden",
    position: "relative",
  },

  overlayTop: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overlayBottom: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 5,
    alignItems: "flex-start",
  },
  overlayText: {
    color: "white",
    fontWeight: "900",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },

  posBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  posBarca: { backgroundColor: "rgba(220,20,60,0.75)" },
  posMadrid: { backgroundColor: "rgba(255,255,255,0.75)" },
  posText: { fontWeight: "900", color: "black" },

  centerLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  centerCircle: {
    position: "absolute",
    width: "22%",
    height: "22%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    left: "39%",
    top: "39%",
  },

  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dotGK: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dotHolder: {
    borderWidth: 3,
    borderColor: "#ffcc00",
  },
  dotBarca: {
    backgroundColor: "crimson",
    borderColor: "rgba(255,255,255,0.65)",
  },
  dotMadrid: { backgroundColor: "white", borderColor: "rgba(0,0,0,0.25)" },

  ball: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ffcc00",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.25)",
  },

  legend: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  legendBall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffcc00",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.25)",
  },
  legendText: { marginLeft: 6, fontWeight: "700" },
});
