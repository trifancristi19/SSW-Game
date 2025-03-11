import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function GameScreen({ route, navigation }) {
  const { gameId, gameCode } = route.params;
  const [gameData, setGameData] = useState(null);
  const [content, setContent] = useState({
    quizzes: [],
    puzzles: [],
    quests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    try {
      // First fetch the game document
      const gameRef = doc(db, "games", gameId);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        Alert.alert("Error", "Game not found");
        navigation.goBack();
        return;
      }

      const gameData = {
        id: gameSnap.id,
        ...gameSnap.data()
      };
      
      setGameData(gameData);
      await loadGameContent(gameData);
    } catch (error) {
      console.error("Error loading game:", error);
      Alert.alert("Error", "Failed to load game data");
      navigation.goBack();
    }
  };

  const loadGameContent = async (gameData) => {
    try {
      const contentData = {
        quizzes: [],
        puzzles: [],
        quests: [],
      };

      // Load quizzes
      if (gameData.quizzes?.length > 0) {
        const quizPromises = gameData.quizzes.map(async (quizId) => {
          const quizDoc = await getDoc(doc(db, "quizzes", quizId));
          if (quizDoc.exists()) {
            return { id: quizDoc.id, type: "quiz", ...quizDoc.data() };
          }
          return null;
        });
        contentData.quizzes = (await Promise.all(quizPromises)).filter(Boolean);
      }

      // Load puzzles
      if (gameData.puzzles?.length > 0) {
        const puzzlePromises = gameData.puzzles.map(async (puzzleId) => {
          const puzzleDoc = await getDoc(doc(db, "puzzles", puzzleId));
          if (puzzleDoc.exists()) {
            return { id: puzzleDoc.id, type: "puzzle", ...puzzleDoc.data() };
          }
          return null;
        });
        contentData.puzzles = (await Promise.all(puzzlePromises)).filter(Boolean);
      }

      // Load quests
      if (gameData.quests?.length > 0) {
        const questPromises = gameData.quests.map(async (questId) => {
          const questDoc = await getDoc(doc(db, "quests", questId));
          if (questDoc.exists()) {
            return { id: questDoc.id, type: "quest", ...questDoc.data() };
          }
          return null;
        });
        contentData.quests = (await Promise.all(questPromises)).filter(Boolean);
      }

      setContent(contentData);
    } catch (error) {
      console.error("Error loading game content:", error);
      Alert.alert("Error", "Failed to load game content");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const hasNoContent =
    content.quizzes.length === 0 &&
    content.puzzles.length === 0 &&
    content.quests.length === 0;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={require("../assets/uni_logo.png")} style={styles.logo} />
        <TouchableOpacity>
          <Text style={styles.gearIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentWrapper}>
          {/* Game Title Section */}
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.titleText}>
            {gameData.name || gameData.gameName}
          </Text>
          <Text style={styles.subtitleText}>Game ID: {gameId}</Text>

          {hasNoContent ? (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContent}>No content available</Text>
            </View>
          ) : (
            <>
              {content.quizzes.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Quizzes</Text>
                  {content.quizzes.map((item) => (
                    <View key={item.id} style={styles.contentCard}>
                      <Text style={styles.contentName}>
                        {item.title || "Untitled Quiz"}
                      </Text>
                      {item.description && (
                        <Text style={styles.contentDescription}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {content.puzzles.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Puzzles</Text>
                  {content.puzzles.map((item) => (
                    <View key={item.id} style={styles.contentCard}>
                      <Text style={styles.contentName}>
                        {item.title || "Untitled Puzzle"}
                      </Text>
                      {item.description && (
                        <Text style={styles.contentDescription}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {content.quests.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Quests</Text>
                  {content.quests.map((item) => (
                    <View key={item.id} style={styles.contentCard}>
                      <Text style={styles.contentName}>
                        {item.title || "Untitled Quest"}
                      </Text>
                      {item.description && (
                        <Text style={styles.contentDescription}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Decorative Bottom Images */}
      <View style={styles.bottomImages}>
        <Image source={require("../assets/image 6.png")} style={styles.image} />
        <Image
          source={require("../assets/image 7 (1).png")}
          style={styles.image}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF8CB2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF8CB2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  gearIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  contentWrapper: {
    padding: 20,
    paddingBottom: 100, // Extra padding for bottom images
  },
  welcomeText: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
  },
  titleText: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
    marginVertical: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  contentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  contentDescription: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },
  noContentContainer: {
    padding: 20,
    alignItems: "center",
  },
  noContent: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  bottomImages: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
});
