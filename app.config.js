import "dotenv/config";

export default {
  expo: {
    name: "LaLiga Stats App",
    slug: "laliga-stats-app",
    scheme: "laligaapp",
    userInterfaceStyle: "automatic",
    extra: {
      API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
      API_FOOTBALL_BASE: process.env.API_FOOTBALL_BASE,
    },
  },
};
