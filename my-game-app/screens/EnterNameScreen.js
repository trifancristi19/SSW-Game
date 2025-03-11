import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function EnterNameScreen() {
    const [teamName, setTeamName] = useState('');
    const navigation = useNavigation();
    const route = useRoute();
    const { gameCode } = route.params;

    const handleDismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleSubmit = () => {
        if (teamName.trim() === '') {
            Alert.alert('Error', 'Please enter a team name');
            return;
        }

        navigation.navigate('StartGame', {
            gameCode: gameCode,
            teamName: teamName.trim()
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
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

                        {/* Team Name Input */}
                        <Text style={styles.inputLabel}>Enter Your Team Name</Text>
                        <TextInput
                            style={styles.codeInput}
                            placeholder="Team Name"
                            placeholderTextColor="#666"
                            value={teamName}
                            onChangeText={setTeamName}
                            maxLength={32}
                            autoCorrect={false}
                        />

                        {/* Start Discovering Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Start Discovering</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>

            <View style={styles.bottomImagesContainer}>
                <Image
                    source={require("../assets/image 8.png")}
                    style={styles.imageBottomLeft}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FF8CB2",
        alignItems: "center",
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: "contain",
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
    welcomeText: {
        marginTop: 30,
        fontSize: 18,
        color: "black",
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
        backgroundColor: "#FDF0F0",
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
    },
    tagRotateRight: {
        transform: [{ rotate: "10deg" }],
    },
    inputLabel: {
        marginTop: 20,
        fontSize: 16,
        color: "black",
    },
    codeInput: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        width: "80%",
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        marginTop: 20,
        backgroundColor: "#F44336",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    bottomImagesContainer: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        width: 130,
        height: 65,
        backgroundColor: '#FF8CB2',
        paddingBottom: 10,
    },
    imageBottomLeft: {
        width: 130,
        height: 65,
        resizeMode: "contain",
    },
});
