import axios from "axios";
import Constants from "expo-constants";

const API_KEY = Constants.expoConfig?.extra?.API_FOOTBALL_KEY;
const BASE_URL =
  Constants.expoConfig?.extra?.API_FOOTBALL_BASE ||
  "https://v3.football.api-sports.io";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-apisports-key": API_KEY,
  },
  timeout: 15000,
});
