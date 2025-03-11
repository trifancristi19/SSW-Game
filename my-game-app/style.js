import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const App = () => {
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image source={require('./assets/uni_logo.png')} style={styles.logo} />
                <TouchableOpacity>
                    <Text style={styles.gearIcon}>⚙</Text>
                </TouchableOpacity>
            </View>

            {/* Welcome Section */}
            <Text style={styles.welcomeText}>Welcome to the</Text>
            <Text style={styles.titleText}>
                Study Start{'\n'}<Text style={styles.titleText}>Week</Text>
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

            {/* Call to Action */}
            <Text style={styles.subText}>Start discovering the campus now</Text>
            <View style={styles.circleContainer}>
                <View style={styles.circle}></View>
                <View style={styles.circle}></View>
                <View style={styles.circle}></View>
                <View style={styles.circle}></View>
            </View>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Enter</Text>
            </TouchableOpacity>

            {/* Decorative Bottom Images */}
            <View style={styles.bottomImages}>
                {/* Replace 'require' paths with actual images */}
                <Image source={require('./assets/image 6.png')} style={styles.image} />
                <Image source={require('./assets/image 7 (1).png')} style={styles.image} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF8CB2',
        alignItems: 'center',
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    gearIcon: {
        fontSize: 24,
    },
    welcomeText: {
        marginTop: 30,
        fontSize: 18,
        color: 'black',
    },
    titleText: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        color: '#FFFFFF',
    },
    tagContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#FDF0F0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        margin: 5,
        borderRadius: 10,
    },
    tagText: {
        color: '#333',
        fontSize: 14,
    },
    tagRotateLeft: {
        transform: [{ rotate: '-10deg' }],
    },
    tagRotateCenter: {
        transform: [{ rotate: '0deg' }],
    },
    tagRotateRight: {
        transform: [{ rotate: '10deg' }],
    },
    subText: {
        marginTop: 20,
        fontSize: 16,
        color: 'black',
    },
    circleContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    circle: {
        width: 20,
        height: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        marginHorizontal: 5,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#F44336',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    bottomImages: {
        position: 'absolute',
        bottom: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    image: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
});

export default App;
