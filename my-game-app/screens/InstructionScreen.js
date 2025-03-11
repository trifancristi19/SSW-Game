import React from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

export default function InstructionScreen() {
  const navigation = useNavigation(); // Initialize navigation

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
          <Image
            source={require("../assets/uni_logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.gearIconContainer}>
          <Image
            source={require("../assets/setting.png")}
            style={styles.gearIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>How to Play</Text>
        <View style={styles.headRow}>
          <View style={styles.text}>
            <Text style={styles.step}>
              <Text style={styles.stepTitle}>1. Start the Game:</Text> Enter
              your team name and the provided PIN code to begin.
            </Text>
            <Text style={styles.step}>
              <Text style={styles.stepTitle}>2. Choose Challenges:</Text> You
              can select any available challenge from the list. Each completed
              challenge earns you points!
            </Text>
            <Text style={styles.step}>
              <Text style={styles.stepTitle}>3. Types of Challenges:</Text>
            </Text>
            <Text style={styles.subStep}>
              <Text style={styles.subStepTitle}>Quests:</Text> Find and
              photograph specific objects around campus. Some quests require you
              to be in specific locations to complete them.
            </Text>
            <Text style={styles.subStep}>
              <Text style={styles.subStepTitle}>Puzzles:</Text> Arrange three
              image pieces in the correct order by tapping on them. Place each
              piece in its correct position to complete the puzzle.
            </Text>
            <Text style={styles.subStep}>
              <Text style={styles.subStepTitle}>Quizzes:</Text> Answer
              multiple-choice questions. Choose carefully - only one answer is
              correct!
            </Text>
            <Text style={styles.step}>
              <Text style={styles.stepTitle}>4. Progress:</Text> Completed
              challenges disappear from your list. Keep track of your score at
              the top of the screen!
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>When You Succeed</Text>
        <View style={styles.row}>
          <Image
            source={require("../assets/phoneTick.png")}
            style={styles.image}
          />
          <Text style={styles.text}>
            You'll receive points for completing the challenge and it will be
            removed from your list. Your team's score will update automatically!
          </Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>If You Need to Try Again</Text>
        <View style={styles.row}>
          <Image
            source={require("../assets/phoneX.png")}
            style={styles.image}
          />
          <Text style={styles.text}>
            Don't worry! For quests, take another photo. For puzzles, try a
            different arrangement. For quizzes, choose another answer. Keep
            trying until you succeed!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff8cb2", // Pink background color
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#e52329", // Red color for titles
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "left",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    paddingLeft: 50,
    paddingRight: 50,
  },
  icon: {
    width: 50,
    height: 70,
    alignSelf: "center",
  },
  text: {
    fontSize: 16,
    color: "#000",
    textAlign: "left",
    padding: 10,
    marginLeft: 10,
  },
  image: {
    width: 100,
    height: 165,
    alignSelf: "center",
    paddingTop: 15,
  },
  step: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  stepTitle: {
    fontWeight: "bold",
    color: "#d81b60", // Deep pink for emphasis
  },
  highlight: {
    fontStyle: "italic",
    color: "#00796b", // Teal for highlighted words
  },
  subStep: {
    fontSize: 16,
    color: "#555",
    marginBottom: 2,
  },
  subStepTitle: {
    fontWeight: "bold",
    color: "#333",
  },
});
