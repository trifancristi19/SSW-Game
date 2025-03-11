import axios from "axios";

const API_URL = "http://192.168.178.168:8081";

export const fetchGames = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/games`);
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
};

export const joinGameSession = async (code) => {
  try {
    const response = await axios.get(`${API_URL}/api/sessions/${code}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Invalid game code");
    }
    throw error;
  }
};
