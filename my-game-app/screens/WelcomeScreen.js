import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameData, setGameData] = useState(null);
  const navigation = useNavigation();
  const [content, setContent] = useState({
    quizzes: [],
    puzzles: [],
    quests: [],
  });
  const [showContent, setShowContent] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // const verifyGameCode = async () => {
  //   if (gameCode.length !== 6) {
  //     Alert.alert("Invalid Code", "Please enter a valid 6-digit code");
  //     return;
  //   }
  //
  //   setLoading(true);
  //   try {
  //     // Check if code exists and is valid
  //     const codesRef = collection(db, "gameCodes");
  //     const q = query(
  //       codesRef,
  //       where("code", "==", gameCode),
  //       where("isValid", "==", true)
  //     );
  //     const querySnapshot = await getDocs(q);
  //
  //     if (querySnapshot.empty) {
  //       Alert.alert("Invalid Code", "This code is not valid or has expired");
  //       return;
  //     }
  //
  //     const gameCodeDoc = querySnapshot.docs[0];
  //     const gameCodeData = gameCodeDoc.data();
  //
  //     // Get the game details
  //     const gameRef = doc(db, "games", gameCodeData.gameId);
  //     const gameDoc = await getDoc(gameRef);
  //
  //     if (!gameDoc.exists()) {
  //       Alert.alert("Error", "Game not found");
  //       return;
  //     }
  //
  //     const newGameData = {
  //       id: gameDoc.id,
  //       ...gameDoc.data(),
  //       content: gameDoc.data().content || {}, // Ensure content exists
  //     };
  //
  //     console.log("Game data found:", newGameData);
  //     setGameData(newGameData);
  //
  //     // Load content directly from the game data
  //     const contentData = {
  //       quizzes: newGameData.content?.quizzes || [],
  //       puzzles: newGameData.content?.puzzles || [],
  //       quests: newGameData.content?.quests || [],
  //     };
  //
  //     setContent(contentData);
  //     setShowContent(true);
  //   } catch (error) {
  //     console.error("Error verifying code:", error);
  //     Alert.alert("Error", "Failed to verify game code");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const verifyGameCode = async () => {
    if (gameCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
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

      const gameRef = doc(db, "games", gameCodeData.gameId);
      const gameDoc = await getDoc(gameRef);

      if (!gameDoc.exists()) {
        Alert.alert("Error", "Game not found");
        return;
      }

      const newGameData = {
        id: gameDoc.id,
        ...gameDoc.data(),
      };

      console.log("Game data found:", newGameData);

      // Navigate to the StartGameScreen and pass the game data
      navigation.navigate("EnterName", { gameCode });
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Error", "Failed to verify game code");
    } finally {
      setLoading(false);
    }
  };

  const renderWelcomeView = () => (
    <>
      <Text style={styles.welcomeText}>Welcome to the</Text>
      <Text style={styles.titleText}>
        Study Start{"\n"}
        <Text style={styles.titleText}>Week</Text>
      </Text>

      <View style={styles.tagContainer}>
        <View style={[styles.tag, styles.tagRotateLeft]}>
          <Text style={styles.tagText}>#NHL Stenden</Text>
        </View>
        <View style={[styles.tag, styles.tagRotateCenter]}>
          <Text style={styles.tagText}>#Inspired</Text>
        </View>
        <View style={[styles.tag, styles.tagRotateRight]}>
          <Text style={styles.tagText}>2024-2025</Text>
        </View>
        <View style={[styles.tag, styles.tagRotateLeft]}>
          <Text style={styles.tagText}>#Emmen</Text>
        </View>
      </View>

      <Text style={styles.subText}>Start discovering the campus now</Text>

      <View style={styles.codeContainer}>
        <Text style={styles.codeText}>CODE: </Text>
        <TextInput
          style={styles.codeInput}
          placeholder="Enter 6-digit code"
          value={gameCode}
          onChangeText={setGameCode}
          maxLength={6}
          keyboardType="number-pad"
          placeholderTextColor="#666"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={verifyGameCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Enter</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderGameContent = () => {
    console.log("Current game data:", gameData);
    console.log("Current content:", content);

    const hasNoContent =
      (!content.quizzes || content.quizzes.length === 0) &&
      (!content.puzzles || content.puzzles.length === 0) &&
      (!content.quests || content.quests.length === 0);

    return (
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.titleText}>
            {gameData?.name || gameData?.gameName || "Game"}
          </Text>
          <Text style={styles.subtitleText}>Game ID: {gameData?.id}</Text>

          {hasNoContent ? (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContent}>
                No content available {"\n"}
                Debug info: {"\n"}
                Game Data: {JSON.stringify(gameData?.content, null, 2)}
              </Text>
            </View>
          ) : (
            <>
              {content.quizzes?.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Quizzes</Text>
                  {content.quizzes.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.contentCard}
                      onPress={() => console.log("Quiz selected:", item)}
                    >
                      <Text style={styles.contentName}>
                        {item.title || "Untitled Quiz"}
                      </Text>
                      {item.description && (
                        <Text style={styles.contentDescription}>
                          {item.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {content.puzzles?.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Puzzles</Text>
                  {content.puzzles.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.contentCard}
                      onPress={() => console.log("Puzzle selected:", item)}
                    >
                      <Text style={styles.contentName}>
                        {item.title || "Untitled Puzzle"}
                      </Text>
                      {item.description && (
                        <Text style={styles.contentDescription}>
                          {item.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {content.quests?.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Quests</Text>
                  {content.quests.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.contentCard}
                      onPress={() => console.log("Quest selected:", item)}
                    >
                      <Text style={styles.contentName}>
                        {item.title || "Untitled Quest"}
                      </Text>
                      {item.description && (
                        <Text style={styles.contentDescription}>
                          {item.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
          {/* Add padding at the bottom to ensure last items are visible */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../assets/uni_logo.png")}
            style={styles.logo}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Instruction')}>
             <View style={styles.gearIconContainer}>
               <Image source={require('../assets/setting.png')} style={styles.gearIcon} />
             </View>
          </TouchableOpacity>
        </View>

        {showContent ? renderGameContent() : renderWelcomeView()}

        <View style={styles.bottomImages}>
          <Image
            source={require("../assets/image 6.png")}
            style={styles.image}
          />
          <Image
            source={require("../assets/image 7 (1).png")}
            style={styles.image}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF8CB2",
    alignItems: "center",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  gearIconContainer: {
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 25, // Half of the container's width/height for a circle
    width: 50, // Circle size (adjust as needed)
    height: 50, // Circle size (adjust as needed)
    justifyContent: 'center', // Center the gear icon inside the circle
    alignItems: 'center', // Center the gear icon inside the circle
  },
  gearIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  welcomeText: {
    marginTop: 30,
    fontSize: 18,
    color: "black",
  },
  titleText: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "#FFFFFF",
  },
  tagContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#FDF0F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
    borderRadius: 10,
  },
  tagText: {
    color: "#333",
    fontSize: 14,
  },
  tagRotateLeft: {
    transform: [{ rotate: "-10deg" }],
  },
  tagRotateCenter: {
    transform: [{ rotate: "0deg" }],
  },
  tagRotateRight: {
    transform: [{ rotate: "10deg" }],
  },
  subText: {
    marginTop: 20,
    fontSize: 16,
    color: "black",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    width: "80%",
  },
  codeText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    letterSpacing: 2,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#F44336",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  bottomImages: {
    position: "absolute",
    bottom: 7,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  image: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  scrollContainer: {
    flex: 1,
  },
  contentWrapper: {
    padding: 20,
    paddingBottom: 100,
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
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 70,
  },
  contentWrapper: {
    width: "100%",
  },
});
