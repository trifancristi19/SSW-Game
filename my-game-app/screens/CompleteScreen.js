import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';

export default function CompleteScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Cera-Bold': require('../assets/fonts/CeraPRO-Bold.otf'),
    'Cera-Regular': require('../assets/fonts/CeraPRO-Regular.otf'),
  });


  return (
    <View style={styles.container}>
      {/* Header with logo and settings */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => console.log('Settings clicked')}>
          <View style={styles.buttonContainer}>
            <Image
              source={require('../assets/images/settings-icon.png')}
              style={styles.settingsIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Image Between Header and Main Content */}
      <Image
        source={require('../assets/images/PartyingFace.png')} // Adjust path to your image
        style={styles.middleImage}
      />

      {/* Main Content */}
      <Text style={styles.title}>NHLStenden SSW Complete</Text>
      <Text style={styles.description}>
        Awesome job completing the quiz. Your results are zooming their way to your inbox. Sharing is caring, don’t forget to show off your knowledge to friends and family.
      </Text>

      {/* Complete Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.buttonText}>Complete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FF8CB2',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF8CB2', // Optional background for the header
    zIndex: 10,
  },
  buttonContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  middleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 80,

  },
  title: {
    fontSize: 24,
    fontFamily: 'Cera-Bold', // Custom font
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Cera-Regular', // Custom font
    textAlign: 'center',
    marginBottom: 30,
    color: 'white',
  },
  button: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
