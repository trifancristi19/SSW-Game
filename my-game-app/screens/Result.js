import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Result({ route, navigation }) {
  const { score, total } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quiz Completed!</Text>
      <Text style={styles.score}>Your Score: {score} / {total}</Text>
      <Button title="View Leaderboard" onPress={() => navigation.navigate('Leaderboard')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 24,
    marginBottom: 10,
  },
  score: {
    fontSize: 20,
    marginBottom: 20,
  },
});
