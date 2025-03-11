import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  Animated,
  ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const BASE_URL = "http://172.20.10.5:3000"; // Use the IP address shown in your Expo console
const SCREEN_WIDTH = Dimensions.get("window").width;
const PUZZLE_HEIGHT = 140; // Adjusted for better visibility
const IMAGE_HEIGHT = 420; // PUZZLE_HEIGHT * 3
const INITIAL_POSITIONS = [
  { x: 20, y: 0 },
  { x: SCREEN_WIDTH - 180, y: 0 },
  { x: SCREEN_WIDTH / 2 - 80, y: PUZZLE_HEIGHT + 20 },
];

export default function PuzzleScreen({ route, navigation }) {
  const { puzzleId } = route.params;
  const [loading, setLoading] = useState(true);
  const [puzzleData, setPuzzleData] = useState(null);
  const [puzzlePieces, setPuzzlePieces] = useState([]);
  const [solved, setSolved] = useState(false);
  const [piecesPositions, setPiecesPositions] = useState(() => {
    return INITIAL_POSITIONS;
  });
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [lockedPieces, setLockedPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState({});
  const [imageUrl, setImageUrl] = useState(null);

  // Initialize animated values for each piece
  const [positions] = useState([
    new Animated.ValueXY(),
    new Animated.ValueXY(),
    new Animated.ValueXY(),
  ]);

  useEffect(() => {
    fetchPuzzleData();
  }, []);

  const fetchPuzzleData = async () => {
    try {
      setLoading(true);
      const puzzleRef = doc(db, "puzzle", puzzleId);
      const puzzleSnapshot = await getDoc(puzzleRef);

      if (!puzzleSnapshot.exists()) {
        Alert.alert("Error", "Puzzle not found");
        navigation.goBack();
        return;
      }

      const data = puzzleSnapshot.data();
      console.log("Puzzle data:", data); // Debug log

      if (data.images && data.images[0] && data.images[0].path) {
        const imagePath = data.images[0].path;
        const url = `${BASE_URL}${imagePath}`;
        console.log("Full image URL:", url); // Debug log

        // Test the URL before setting it
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error(
              "Image URL test failed:",
              response.status,
              response.statusText
            );
            Alert.alert("Error", "Image URL is not accessible");
            return;
          }
          console.log("Image URL test successful");
          setImageUrl(url);
        } catch (error) {
          console.error("Image URL test error:", error);
          Alert.alert("Error", "Cannot connect to image server");
          return;
        }
      } else {
        console.log("No image path found in data:", data);
        Alert.alert("Error", "Puzzle image not found");
        navigation.goBack();
        return;
      }

      setPuzzleData(data);
      // Create three pieces from the single image
      const pieces = [
        { id: 0, order: 0 },
        { id: 1, order: 1 },
        { id: 2, order: 2 },
      ];

      // Shuffle the pieces but keep track of their original order
      const shuffledPieces = pieces
        .map((piece) => ({ ...piece, shuffledOrder: piece.order }))
        .sort(() => Math.random() - 0.5);

      setPuzzlePieces(shuffledPieces);
    } catch (error) {
      console.error("Error in fetchPuzzleData:", error);
      Alert.alert("Error", "Failed to load puzzle");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Initialize pieces in their starting positions
  useEffect(() => {
    positions.forEach((pos, index) => {
      pos.setValue({
        x: INITIAL_POSITIONS[index].x,
        y: INITIAL_POSITIONS[index].y,
      });
    });
  }, []);

  const handlePiecePress = (index) => {
    if (!lockedPieces.includes(index)) {
      setSelectedPiece(index);
    }
  };

  const handleBoxPress = (boxIndex) => {
    if (selectedPiece === null) return;

    // Check if this is the correct slot for the selected piece
    const selectedPieceData = puzzlePieces[selectedPiece];
    if (boxIndex === selectedPieceData.order) {
      // Correct placement
      setLockedPieces((prev) => [...prev, selectedPiece]);
      setPlacedPieces((prev) => ({
        ...prev,
        [boxIndex]: selectedPiece,
      }));

      // Check if puzzle is complete
      if (lockedPieces.length === 2) {
        // This means we're placing the last piece
        setTimeout(() => {
          setSolved(true);
          Alert.alert("Congratulations!", "You've completed the puzzle!", [
            {
              text: "OK",
              onPress: () => {
                if (route.params?.onComplete) {
                  route.params.onComplete(puzzleData.pointsValue || 0);
                }
                navigation.goBack();
              },
            },
          ]);
        }, 500);
      }
    } else {
      // Wrong placement
      Alert.alert(
        "Try Again",
        "This is not the correct position for this piece"
      );
    }
    setSelectedPiece(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/uni_logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Instruction")}>
          <View style={styles.gearIconContainer}>
            <Image
              source={require("../assets/setting.png")}
              style={styles.gearIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.titleText}>Puzzle Challenge</Text>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{puzzleData.description}</Text>
          </View>

          {/* Target Boxes */}
          <View style={styles.targetBoxContainer}>
            {[0, 1, 2].map((index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.targetBox,
                  lockedPieces.includes(placedPieces[index]) &&
                    styles.lockedBox,
                  selectedPiece !== null && styles.highlightedBox,
                ]}
                onPress={() => handleBoxPress(index)}
                disabled={lockedPieces.includes(placedPieces[index])}
              >
                {placedPieces[index] !== undefined && (
                  <Image
                    source={imageUrl ? { uri: imageUrl } : null}
                    style={[
                      styles.pieceImage,
                      {
                        transform: [
                          {
                            translateY:
                              -puzzlePieces[placedPieces[index]].shuffledOrder *
                              PUZZLE_HEIGHT,
                          },
                        ],
                      },
                    ]}
                    resizeMode="cover"
                    onError={(error) =>
                      console.error(
                        "Image loading error:",
                        error.nativeEvent.error
                      )
                    }
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Puzzle Pieces */}
          <View style={styles.piecesContainer}>
            {puzzlePieces.map((piece, index) => (
              <TouchableOpacity
                key={piece.id}
                style={[
                  styles.puzzlePiece,
                  {
                    opacity: lockedPieces.includes(index) ? 0.5 : 1,
                    borderColor:
                      selectedPiece === index ? "#fff" : "transparent",
                    borderWidth: selectedPiece === index ? 2 : 0,
                  },
                ]}
                onPress={() => handlePiecePress(index)}
                disabled={lockedPieces.includes(index)}
              >
                <Image
                  source={imageUrl ? { uri: imageUrl } : null}
                  style={[
                    styles.pieceImage,
                    {
                      transform: [
                        {
                          translateY: -piece.shuffledOrder * PUZZLE_HEIGHT,
                        },
                      ],
                    },
                  ]}
                  resizeMode="cover"
                  onError={(error) =>
                    console.error(
                      "Image loading error:",
                      error.nativeEvent.error
                    )
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          {puzzleData.pointsValue && (
            <View style={styles.pointsContainer}>
              <Image
                source={require("../assets/crown.png")}
                style={styles.pointsIcon}
              />
              <Text style={styles.pointsText}>
                Points: {puzzleData.pointsValue}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF8CB2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
  },
  descriptionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    padding: 25,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  descriptionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  puzzleContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: PUZZLE_HEIGHT * 3,
    marginVertical: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 20,
  },
  puzzlePiece: {
    width: SCREEN_WIDTH - 40,
    height: PUZZLE_HEIGHT,
    backgroundColor: "#fff",
    elevation: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  pieceImage: {
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: "#fff",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  pointsIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 10,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  targetBox: {
    width: SCREEN_WIDTH - 40,
    height: PUZZLE_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
  },
  lockedBox: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  highlightedBox: {
    borderColor: "#FFD700",
    borderWidth: 3,
  },
  piecesContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  targetBoxContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
});
