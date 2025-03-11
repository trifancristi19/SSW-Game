import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "./screens/WelcomeScreen";
import JoinGameScreen from "./screens/JoinGameScreen";
import GameScreen from "./screens/GameScreen";
import StartGameScreen from "./screens/StartGameScreen";
import ChooseGameScreen from "./screens/ChooseGameScreen";
import InstructionScreen from "./screens/InstructionScreen";
import QuizScreen from "./screens/QuizScreen";
import PuzzleScreen from "./screens/PuzzleScreen";
import EndGameScreen from "./screens/EndGameScreen";
import FeedBackScreen from "./screens/FeedBackScreen";
import EnterNameScreen from "./screens/EnterNameScreen";
import QuestScreen from "./screens/QuestScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#FF8CB2",
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="JoinGame"
        component={JoinGameScreen}
        options={{
          headerShown: true,
          title: "Join Game",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen name="Instruction" component={InstructionScreen} />
      <Stack.Screen name="ChooseGame" component={ChooseGameScreen} />
      <Stack.Screen name="StartGame" component={StartGameScreen} />
      <Stack.Screen name="EndGame" component={EndGameScreen} />
      <Stack.Screen name="Feedback" component={FeedBackScreen} />
      <Stack.Screen name="EnterName" component={EnterNameScreen} />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{
          headerShown: true,
          title: "Game Details",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Puzzle"
        component={PuzzleScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="Quest" component={QuestScreen} />
    </Stack.Navigator>
  );
}
