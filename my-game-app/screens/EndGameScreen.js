import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import LeaderboardModal from '../components/LeaderboardModal';
import ScoreService from '../services/ScoreService';

export default function EndGameScreen({ route }) {
  const navigation = useNavigation(); // Initialize navigation
  const { finalScore, timeTaken, teamName, gameCode } = route.params || { 
    finalScore: 0, 
    timeTaken: 0,
    teamName: '',
    gameCode: ''
  };

  // Add state for leaderboard visibility
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [teams, setTeams] = useState([]);
  const [completedTeams, setCompletedTeams] = useState([]);

  // Add a new useEffect specifically for polling completed teams
  useEffect(() => {
    const pollCompletedTeams = async () => {
      if (gameCode) {
        const completed = await ScoreService.getCompletedTeams(gameCode);
        console.log('Updated completed teams:', completed);
        setCompletedTeams(completed);
      }
    };

    // Initial fetch
    pollCompletedTeams();

    // Set up polling interval
    const interval = setInterval(pollCompletedTeams, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval); // Cleanup interval on unmount
    };
  }, [gameCode]);

  // Modify the existing useEffect to focus only on saving the score
  useEffect(() => {
    const initializeScores = async () => {
      if (gameCode && teamName) {
        try {
          // Save the final score with completion time
          await ScoreService.updateScoreWithTime(gameCode, teamName, finalScore, timeTaken);
          console.log('Saved score and time for team:', teamName);
          
          // Initialize regular score polling for the game
          await ScoreService.initialize(gameCode);
          ScoreService.startPolling((updatedScores) => {
            setTeams(updatedScores);
          });
        } catch (error) {
          console.error('Error in EndGameScreen:', error);
        }
      }
    };

    initializeScores();

    return () => {
      ScoreService.stopPolling();
      ScoreService.clearScores();
    };
  }, [gameCode, teamName, finalScore, timeTaken]);

  // Function to format time from seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
          <Image source={require('../assets/uni_logo.png')} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.gearIconContainer}
          onPress={() => navigation.navigate('Instruction')}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/setting.png')}
            style={styles.gearIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../assets/Partying Face.png')}
          style={styles.face}
        />
        <Text style={styles.title}>NHL Stenden</Text>
        <Text style={styles.subTitle}>SSW Complete</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Image
              source={require('../assets/crown.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statText} numberOfLines={1}>Final Score: {finalScore}</Text>
          </View>
          <View style={styles.statItem}>
            <Image
              source={require('../assets/sand-clock.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statText} numberOfLines={1}>Time Taken: {formatTime(timeTaken)}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          Congratulations on completing the Study Start Week activities! 
        </Text>

        <TouchableOpacity
          style={styles.leaderboardButton}
          onPress={() => setShowLeaderboard(true)}
        >
          <Text style={styles.leaderboardButtonText}>Show Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Feedback')}
        >
          <Text style={styles.continueButtonText}>Complete</Text>
        </TouchableOpacity>
      </View>

      <LeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentTeam={teamName}
        teams={completedTeams}
        showCompletionTime={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff8cb2',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  gearIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gearIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 33,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 33,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  face: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'left',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingLeft: 50,
    paddingRight: 50,
  },
  icon: {
    width: 50,
    height: 70,
    alignSelf: 'center',
  },
  text: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
    padding: 10,
    marginLeft: 10,
  },
  image: {
    width: 100,
    height: 165,
    alignSelf: 'center',
    paddingTop: 15,
  },
  continueButton: {
    backgroundColor: '#FF4D4D',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  statIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
  },
  statText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  leaderboardButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10, // Space between the two buttons
  },
  leaderboardButtonText: {
    color: '#FF4D4D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
