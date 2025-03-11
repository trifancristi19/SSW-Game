import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts } from 'expo-font'; // Import custom fonts with expo-font

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Cera-Bold': require('../assets/fonts/CeraPRO-Bold.otf'), // Adjust font path
    'Cera-Regular': require('../assets/fonts/CeraPRO-Regular.otf'),
  });

  useEffect(() => {
    // Fetch leaderboard data from the JSON source
    fetch('http://172.20.10.2:3000/results')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const formattedData = Array.isArray(data) ? data : [data];

        // Sort players by score in descending order
        const sortedData = formattedData
          .map((item) => ({
            nickname: item.nickname,
            score: item.score,
          }))
          .sort((a, b) => b.score - a.score);

        setPlayers(sortedData);
      })
      .catch((error) => console.error('Error fetching leaderboard data:', error));
  }, []);

  const renderTop3 = () => {
    const podiumColors = ['#E52329', '#ffb743', '#000000'];
    const podiumHeights = [150, 220, 90];

    return (
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        <View style={styles.singlePodiumContainer}>
          <Text style={styles.nickname}>{players[1]?.nickname || ''}</Text>
          <View style={[styles.podiumItem, { backgroundColor: podiumColors[0], height: podiumHeights[0] }]}>
            <Text style={styles.podiumRank}>2</Text>
          </View>
        </View>

        {/* First Place */}
        <View style={styles.singlePodiumContainer}>
          {players[0] && (
            <Image source={require('../assets/images/crown.png')} style={styles.crown} />
          )}
          <Text style={styles.nickname}>{players[0]?.nickname || ''}</Text>
          <View style={[styles.podiumItem, { backgroundColor: podiumColors[1], height: podiumHeights[1] }]}>
            <Text style={styles.podiumRank}>1</Text>
          </View>
        </View>

        {/* Third Place */}
        <View style={styles.singlePodiumContainer}>
          <Text style={styles.nickname}>{players[2]?.nickname || ''}</Text>
          <View style={[styles.podiumItem, { backgroundColor: podiumColors[2], height: podiumHeights[2] }]}>
            <Text style={styles.podiumRank}>3</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRestPlayers = () => {
    return players.slice(3).map((player, index) => (
      <View key={index + 3} style={styles.restItem}>
        <Text style={styles.rank}>{index + 4}.</Text>
        <Text style={styles.name}>{player.nickname}</Text>
        <Text style={styles.score}>{player.score}pt</Text>
      </View>
    ));
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Logo and Settings Icon */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => console.log('Settings clicked')}>
          <View style={styles.buttonContainer}>
            <Image source={require('../assets/images/settings-icon.png')} style={styles.settingsIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Top 3 Players */}
        {renderTop3()}

        {/* Other Players */}
        <View style={styles.restContainer}>{renderRestPlayers()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#FF8CB2',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  settingsIcon: {
    width: 30,
    height: 30,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 250,
  },
  singlePodiumContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  crown: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  podiumItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 0,
    width: '100%',
  },
  nickname: {
    fontSize: 14,
    fontFamily: 'Cera-Regular',
    marginBottom: 5,
    textAlign: 'center',
  },
  podiumRank: {
    fontSize: 22,
    fontFamily: 'Cera-Bold',
    color: '#ffffff',
  },
  restContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
  },
  restItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 5,
  },
  rank: {
    fontSize: 18,
    fontFamily: 'Cera-Bold',
    width: 30,
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Cera-Regular',
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontFamily: 'Cera-Bold',
    textAlign: 'right',
    backgroundColor: '#FF8CB2',
    color: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
  },
});

export default Leaderboard;
