import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function JoinGameScreen({ navigation }) {
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyGameCode = async () => {
    if (gameCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      // Check if code exists and is valid
      const codesRef = collection(db, "gameCodes");
      const q = query(
        codesRef,
        where("code", "==", gameCode),
        where("isValid", "==", true)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Invalid Code", "This code is not valid or has expired");
        return;
      }

      const gameCodeDoc = querySnapshot.docs[0];
      const gameCodeData = gameCodeDoc.data();

      // Get the game details
      const gameRef = collection(db, "games");
      const gameQuery = query(
        gameRef,
        where("__name__", "==", gameCodeData.gameId)
      );
      const gameSnapshot = await getDocs(gameQuery);

      if (gameSnapshot.empty) {
        Alert.alert("Error", "Game not found");
        return;
      }

      const gameDoc = gameSnapshot.docs[0];
      const gameData = gameDoc.data();
      console.log("Found game data:", {
        id: gameDoc.id,
        ...gameData,
        content: gameData.content,
        selectedContent: gameData.selectedContent,
      });

      // Navigate to game screen with game data
      navigation.navigate("Game", {
        gameId: gameDoc.id,
        gameData: gameData,
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Error", "Failed to verify game code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Game</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit code"
        value={gameCode}
        onChangeText={setGameCode}
        maxLength={6}
        keyboardType="number-pad"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={verifyGameCode}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Join Game"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: "white",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
