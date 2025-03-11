import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import LeaderboardModal from "../components/LeaderboardModal";
import ScoreService from "../services/ScoreService";

const LOCATIONS = {
  carpark: { lat: 52.790595, lon: 6.891742 },
  bicycle: { lat: 52.778352, lon: 6.913414 },
  campus: { lat: 52.778, lon: 6.9123 },
};
const MAX_DISTANCE = 5000; // 5 meters

export default function StartGameScreen() {
  const route = useRoute(); // Access navigation parameters
  const navigation = useNavigation();
  const [timeRemaining, setTimeRemaining] = useState(3 * 60 * 60);
  const { gameCode } = route.params || {}; // Extract gameCode
  const [squares, setSquares] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [score, setScore] = useState(0);
  const [completedGames, setCompletedGames] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (gameCode && route.params?.teamName) {
      const teamExists = teams.some(
        (team) => team.name === route.params.teamName
      );

      if (!teamExists) {
        setTeamName(route.params.teamName);
        setTeams((prevTeams) => [
          ...prevTeams,
          {
            name: route.params.teamName,
            code: gameCode,
            score: 0,
          },
        ]);
      }
    }
  }, [gameCode, route.params?.teamName]);

  // Initialize ScoreService when the game starts
  useEffect(() => {
    if (gameCode && teamName) {
      const initializeScoreService = async () => {
        try {
          await ScoreService.initialize(gameCode);
          ScoreService.startPolling((updatedScores) => {
            console.log("Received updated scores:", updatedScores); // Debug log
            setTeams(updatedScores);
          });
        } catch (error) {
          console.error("Error initializing score service:", error);
        }
      };

      initializeScoreService();

      return () => {
        ScoreService.stopPolling();
      };
    }
  }, [gameCode, teamName]);

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const fetchGameContent = async () => {
    try {
      if (!gameCode) {
        Alert.alert("Error", "Game code is missing or invalid.");
        return;
      }

      console.log("Fetching game content for code:", gameCode);

      // 1. First get the gameId from gameCodes collection
      const codesRef = collection(db, "gameCodes");
      const q = query(
        codesRef,
        where("code", "==", gameCode),
        where("isValid", "==", true)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Invalid Code", "This code is not valid or has expired.");
        return;
      }

      const gameCodeDoc = querySnapshot.docs[0];
      const gameCodeData = gameCodeDoc.data();
      const gameId = gameCodeData.gameId;

      console.log("Fetched Game ID from gameCode:", gameId);

      // 2. Get the game document directly using the gameId
      const gameDocRef = doc(db, "games", gameId);
      const gameDocSnap = await getDoc(gameDocRef);

      if (!gameDocSnap.exists()) {
        console.error("Game not found for gameId:", gameId);
        Alert.alert("Error", "Game not found.");
        return;
      }

      const gameData = {
        id: gameId,
        ...gameDocSnap.data(),
      };

      console.log("Game data found:", gameData);

      // 3. Process the game content
      const gameContent = gameData?.content || [];
      const formattedSquares = [];

      console.log("Processing game content:", gameContent);

      for (const contentItem of gameContent) {
        const { id, type } = contentItem;
        if (!id || !type) {
          console.warn("Invalid content item:", contentItem);
          continue;
        }

        let contentDescription = "No description available";
        let collectionName;

        // Map the content type to collection name
        switch (type.toLowerCase()) {
          case "puzzle":
            collectionName = "puzzle";
            break;
          case "quest":
            collectionName = "quest";
            break;
          case "quiz":
            collectionName = "quiz";
            break;
          default:
            console.warn("Unknown content type:", type);
            continue;
        }

        if (collectionName) {
          console.log(`Fetching content from ${collectionName} for ID: ${id}`);
          try {
            const contentRef = doc(db, collectionName, id);
            const contentSnapshot = await getDoc(contentRef);

            if (contentSnapshot.exists()) {
              const contentData = contentSnapshot.data();
              console.log(`Fetched content for ${id}:`, contentData);

              // Handle quiz content differently
              if (type.toLowerCase() === "quiz") {
                contentDescription =
                  contentData.question || "No question available";
              } else {
                contentDescription =
                  contentData.description || "No description available";
              }
            } else {
              console.warn(
                `Content not found: Collection: ${collectionName}, ID: ${id}`
              );
              // Skip this content item if it doesn't exist
              continue;
            }
          } catch (error) {
            console.error(
              `Error fetching content from ${collectionName}:`,
              error
            );
            // Skip this content item if there's an error
            continue;
          }
        }

        // Only add the content if we successfully fetched it
        formattedSquares.push({
          id,
          type,
          text: contentDescription,
        });
      }

      console.log("Formatted squares:", formattedSquares);

      if (formattedSquares.length === 0) {
        Alert.alert("Warning", "No valid content found for this game.");
        return;
      }

      // Set the squares and randomly pick the first current game
      setSquares(formattedSquares);
      chooseRandomContent(formattedSquares);
      setGameStarted(true); // Set game as started after content is loaded
    } catch (error) {
      console.error("Error fetching game content:", error);
      Alert.alert("Error", "Failed to fetch game content.");
    }
  };

  const chooseRandomContent = (contentArray) => {
    if (contentArray.length > 0) {
      const availableGames = contentArray.filter(
        (game) => !completedGames.includes(game.id)
      );
      if (availableGames.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableGames.length);
        const selectedContent = availableGames[randomIndex];

        setCurrentGame(selectedContent);
        setSquares(
          contentArray.filter((game) => game.id !== selectedContent.id)
        );
      }
    }
  };

  useEffect(() => {
    fetchGameContent();
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval); // Stop the timer when it reaches 0
          return 0;
        }
        return prevTime - 1; // Decrease time by 1 second
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const checkAllGamesCompleted = () => {
    // Get total number of games (current game + squares)
    const totalGames = squares.length + (currentGame ? 1 : 0);
    return totalGames === 0 && completedGames.length > 0;
  };

  const handleGameCompletion = async (gameId, points) => {
    try {
      // Update score
      setScore((prevScore) => {
        const newScore = prevScore + points;
        ScoreService.updateScore(teamName, newScore)
          .then(() => {
            console.log(
              `Score updated successfully for ${teamName}: ${newScore}`
            );
          })
          .catch((error) => {
            console.error("Error updating score:", error);
          });
        return newScore;
      });

      // Add game to completed list
      setCompletedGames((prev) => [...prev, gameId]);

      // Remove the completed game from both current game and squares
      if (currentGame?.id === gameId) {
        setCurrentGame(null);
      }
      setSquares((prev) => prev.filter((game) => game.id !== gameId));

      // Get truly remaining games (excluding completed ones)
      const allRemainingGames = [...squares, currentGame]
        .filter((game) => game && game.id !== gameId)
        .filter((game) => !completedGames.includes(game.id));

      if (allRemainingGames.length > 0) {
        // Choose next game
        const randomIndex = Math.floor(
          Math.random() * allRemainingGames.length
        );
        const nextGame = allRemainingGames[randomIndex];
        setCurrentGame(nextGame);
        setSquares(allRemainingGames.filter((game) => game.id !== nextGame.id));
      } else {
        // No more games to play
        navigation.navigate("EndGame", {
          finalScore: score + points, // Include the points from the last completed game
          timeTaken: 3 * 60 * 60 - timeRemaining,
          teamName: teamName,
          gameCode: gameCode,
        });
        return; // Exit early to prevent showing leaderboard
      }

      // Show leaderboard after updating score
      setTimeout(() => {
        setShowLeaderboard(true);
      }, 500);
    } catch (error) {
      console.error("Error in handleGameCompletion:", error);
      Alert.alert("Error", "Failed to update score. Please try again.");
    }
  };

  const checkLocation = async (requiredLocation) => {
    try {
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location services to play this game."
        );
        return false;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});

      // Get target coordinates
      const targetCoords = LOCATIONS[requiredLocation.toLowerCase()];
      if (!targetCoords) {
        console.error("Invalid location specified:", requiredLocation);
        return false;
      }

      // Calculate distance
      const distance = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        targetCoords.lat,
        targetCoords.lon
      );

      return distance <= MAX_DISTANCE;
    } catch (error) {
      console.error("Error checking location:", error);
      Alert.alert("Error", "Failed to check location.");
      return false;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleGameNavigation = async (game) => {
    // Prevent navigating to completed games
    if (completedGames.includes(game.id)) {
      console.log("Game already completed");
      return;
    }

    try {
      // Get the full game data to check GPS requirements
      const gameDocRef = doc(db, game.type.toLowerCase(), game.id);
      const gameDocSnap = await getDoc(gameDocRef);
      const gameData = gameDocSnap.data();

      // Check if GPS tracking is required
      if (gameData.gpsTracking) {
        const isAtLocation = await checkLocation(gameData.location);
        if (!isAtLocation) {
          Alert.alert(
            "Wrong Location",
            `You are far from the location, hint: ${gameData.location}`
          );
          return;
        }
      }

      // If navigating from remaining content (black squares)
      if (game !== currentGame) {
        if (currentGame && !completedGames.includes(currentGame.id)) {
          setSquares((prev) => [...prev, currentGame]);
        }
        setCurrentGame(game);
        setSquares((prev) => prev.filter((sq) => sq.id !== game.id));
      }

      // Navigate based on game type
      switch (game.type.toLowerCase()) {
        case "quiz":
          navigation.navigate("Quiz", {
            quizId: game.id,
            onComplete: (points) => handleGameCompletion(game.id, points),
          });
          break;
        case "puzzle":
          navigation.navigate("Puzzle", {
            puzzleId: game.id,
            onComplete: (points) => handleGameCompletion(game.id, points),
          });
          break;
        case "quest":
          // Check if the game requires object recognition
          if (gameData.objectRecognition) {
            navigation.navigate("Quest", {
              questId: game.id,
              onComplete: (points) => handleGameCompletion(game.id, points),
            });
          } else {
            // Handle non-object recognition quests differently if needed
            Alert.alert(
              "Quest Type",
              "This quest doesn't require object recognition"
            );
          }
          break;
        default:
          Alert.alert("Error", "Unknown game type");
      }
    } catch (error) {
      console.error("Error handling game navigation:", error);
      Alert.alert("Error", "Failed to start game.");
    }
  };

  // Update the useEffect that checks for game completion
  useEffect(() => {
    if (gameStarted && checkAllGamesCompleted()) {
      navigation.navigate("EndGame", {
        finalScore: score,
        timeTaken: 3 * 60 * 60 - timeRemaining,
        teamName: teamName,
        gameCode: gameCode,
      });
    }
  }, [currentGame, squares, gameStarted, completedGames]); // Add completedGames to dependencies

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
              <Image
                source={require("../assets/uni_logo.png")}
                style={styles.logo}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Instruction")}
            >
              <View style={styles.gearIconContainer}>
                <Image
                  source={require("../assets/setting.png")}
                  style={styles.gearIcon}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Sub Header */}
          <View style={styles.subHeader}>
            <Image
              source={require("../assets/crown.png")}
              style={styles.crown}
            />
            <Text style={styles.score}>{score}</Text>
            <Image
              source={require("../assets/sand-clock.png")}
              style={styles.sandClock}
            />
            <Text style={styles.timeRemain}>{formatTime(timeRemaining)}</Text>
          </View>

          {/* Current Quest */}
          <View style={styles.whiteSquare}>
            <Text style={styles.squareTitle}>Current Game</Text>
            <Text style={styles.squareText}>
              {currentGame ? currentGame.text : "No current game available"}
            </Text>
            {currentGame && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleGameNavigation(currentGame)}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.welcomeText}>Remaining Content</Text>

          {/* Horizontal Scrollable Squares */}
          <View style={styles.scrollViewContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContentContainer}
              snapToAlignment="center"
              decelerationRate="fast"
              snapToInterval={200} // Width of each square (180) + horizontal margin (20)
            >
              {squares
                .filter((square) => !completedGames.includes(square.id))
                .map((square) => (
                  <TouchableOpacity
                    key={square.id}
                    style={styles.square}
                    onPress={() => handleGameNavigation(square)}
                  >
                    <Text style={styles.squareText}>{square.text}</Text>
                    <View style={styles.navigateButton}>
                      <Text style={styles.navigateButtonText}>Navigate</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <LeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentTeam={teamName}
        teams={teams}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF8CB2",
    alignItems: "center",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
    marginBottom: 20,
  },
  crown: {
    width: 65,
    height: 65,
    resizeMode: "contain",
    marginTop: 30,
  },
  score: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginHorizontal: 10,
    marginTop: 30,
  },
  sandClock: {
    width: 65,
    height: 65,
    resizeMode: "contain",
    marginTop: 30,
  },
  timeRemain: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginHorizontal: 10,
    marginTop: 30,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  gearIconContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  gearIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  welcomeText: {
    marginTop: 30,
    fontSize: 24,
    color: "#000",
    marginBottom: 15,
  },
  whiteSquare: {
    width: 328,
    height: 180,
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 30,
    position: "relative",
  },
  squareTitle: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollViewContainer: {
    height: 170, // Slightly larger than the square height
    width: "100%",
    paddingHorizontal: 10,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  square: {
    backgroundColor: "#000",
    borderRadius: 40,
    padding: 20,
    marginHorizontal: 10,
    width: 180,
    height: 150,
    position: "relative",
    elevation: 5, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  squareText: {
    color: "#FF8CB2",
    fontSize: 20,
    textAlign: "left",
    marginBottom: 40,
  },
  navigateButton: {
    position: "absolute",
    bottom: 15,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: "#FF8CB2",
    borderRadius: 21,
    alignItems: "center",
  },
  navigateButtonText: {
    fontSize: 16,
    color: "#000",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FF4D4D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  startButton: {
    position: "absolute",
    bottom: 15,
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: "#FF8CB2",
    borderRadius: 21,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
});
