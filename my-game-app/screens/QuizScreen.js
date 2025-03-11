import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function QuizScreen({ route, navigation }) {
  const { quizId } = route.params;
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const quizRef = doc(db, "quiz", quizId);
      const quizSnapshot = await getDoc(quizRef);

      if (!quizSnapshot.exists()) {
        Alert.alert("Error", "Quiz not found");
        navigation.goBack();
        return;
      }

      const data = quizSnapshot.data();
      console.log("Quiz data:", data);

      if (!data.question || !data.choices) {
        Alert.alert("Error", "Invalid quiz format");
        navigation.goBack();
        return;
      }

      setQuizData(data);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      Alert.alert("Error", "Failed to load quiz");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerPress = (choice, index) => {
    const isCorrect = quizData.choices[index].isCorrect;

    setSelectedAnswer(choice);
    setIsAnswerCorrect(isCorrect);

    // Wait for 1 second to show the feedback
    setTimeout(() => {
      // Quiz completed
      Alert.alert(
        "Quiz Completed",
        `You answered ${isCorrect ? "correctly" : "incorrectly"}!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Pass back the points if answered correctly
              if (isCorrect && route.params?.onComplete) {
                route.params.onComplete(quizData.pointsValue || 0);
              }
              navigation.goBack();
            }
          },
        ]
      );
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
    }, 1000);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!quizData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.messageText}>No quiz available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
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

      {/* Quiz Content */}
      <View style={styles.content}>
        <Text style={styles.titleText}>Quiz Challenge</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{quizData.question}</Text>
        </View>

        <View style={styles.answersContainer}>
          {quizData.choices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerButton,
                selectedAnswer === choice.text && {
                  backgroundColor: isAnswerCorrect ? "#4CAF50" : "#FF5252",
                },
              ]}
              onPress={() => handleAnswerPress(choice.text, index)}
              disabled={selectedAnswer !== null}
            >
              <Text
                style={[
                  styles.answerText,
                  selectedAnswer === choice.text && { color: "#FFFFFF" },
                ]}
              >
                {choice.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {quizData.pointsValue && (
          <View style={styles.pointsContainer}>
            <Image
              source={require("../assets/crown.png")}
              style={styles.pointsIcon}
            />
            <Text style={styles.pointsText}>
              Points: {quizData.pointsValue}
            </Text>
          </View>
        )}
      </View>
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
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
  },
  questionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    padding: 25,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  answersContainer: {
    width: "100%",
    marginTop: 20,
  },
  answerButton: {
    backgroundColor: "#000000",
    padding: 20,
    borderRadius: 40,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  answerText: {
    fontSize: 18,
    color: "#FF8CB2",
    textAlign: "center",
    fontWeight: "500",
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
  messageText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
