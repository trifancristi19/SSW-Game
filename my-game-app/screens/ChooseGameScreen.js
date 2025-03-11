import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function ChooseGameScreen() {
  const route = useRoute();
  const { gameCode } = route.params || {};
  const navigation = useNavigation();

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
            <TouchableOpacity onPress={() => navigation.navigate("Instruction")}>
              <View style={styles.gearIconContainer}>
                <Image
                  source={require("../assets/setting.png")}
                  style={styles.gearIcon}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <Text style={styles.welcomeText}>Welcome to the</Text>
          <Text style={styles.titleText}>
            Study Start{"\n"}
            <Text style={styles.titleText}>Week</Text>
          </Text>

          {/* Rotated Tags */}
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

          {/* Start Discovering Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              navigation.navigate("StartGame", {
                gameCode,
              });
            }}
          >
            <Text style={styles.startButtonText}>Start Discovering</Text>
          </TouchableOpacity>

          {/* Bottom Image */}
          <View style={styles.bottomImages}>
            <Image
              source={require("../assets/image 8.png")}
              style={styles.imageBottomLeft}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    marginTop: 15,
    fontSize: 18,
    color: "black",
    marginBottom: 15,
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
    backgroundColor: "#FFCADA",
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
    backgroundColor: "#D6748F",
  },
  tagRotateRight: {
    transform: [{ rotate: "10deg" }],
  },
  startButton: {
    backgroundColor: "#FF4D4D",
    paddingHorizontal: 40,  // Increased horizontal padding
    paddingVertical: 20,    // Increased vertical padding
    borderRadius: 30,
    marginTop: 50,          // Added more top margin
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',           // Make button wider
    elevation: 3,           // Add shadow for Android
    shadowColor: "#000",    // Add shadow for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 24,           // Increased font size
    fontWeight: "bold",
  },
  bottomImages: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  imageBottomLeft: {
    width: 122,
    height: 61,
    resizeMode: "contain",
  },
});
