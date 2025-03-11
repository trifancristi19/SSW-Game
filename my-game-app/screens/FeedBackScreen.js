import React from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function FeedBackScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
          <Image source={require('../assets/uni_logo.png')} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.gearIconContainer}>
          <Image source={require('../assets/setting.png')} style={styles.gearIcon} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>How are you feeling?</Text>
      <Text style={styles.subTitle}>
        Your input is valuable in helping us better understand your needs and tailor our events accordingly.
      </Text>

      {/* Emoji Row */}
      <View style={styles.emojiRow}>
      <View style={styles.emojiContainer}>
        <Image source={require('../assets/cry.png')} style={styles.emoji} />
      </View>
      <View style={styles.emojiContainer}>
         <Image source={require('../assets/face.png')} style={styles.emoji} />
      </View>
      <View style={styles.emojiContainer}>
         <Image source={require('../assets/smile (2).png')} style={styles.emoji} />
      </View>
      <View style={styles.emojiContainer}>
         <Image source={require('../assets/smile (1).png')} style={styles.emoji} />
      </View>
      <View style={styles.emojiContainer}>
          <Image source={require('../assets/smile.png')} style={styles.emoji} />
      </View>
      </View>

      {/* Comment Box */}
      <TextInput
        style={styles.commentBox}
        placeholder="Add a comment..."
        placeholderTextColor="#aaa"
        multiline
      />

      {/* Go Back Button */}
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => navigation.navigate('Welcome')}
      >
        <Text style={styles.goBackButtonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff8cb2', // Pink background
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80, // Space for button at the bottom
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
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
  },
  gearIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  emojiContainer: {
      backgroundColor: '#fff',
      borderRadius: 50, // Makes the container circular
      width: 70,
      height: 70,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  emoji: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  commentBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    height: 220,
    padding: 15,
    textAlignVertical: 'top', // Ensures text starts at the top
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goBackButton: {
    backgroundColor: '#FF4D4D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});