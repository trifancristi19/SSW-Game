import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchGames } from '../services/api';

const GamesScreen = ({ specificGame }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (specificGame) {
            setGames([specificGame]);
            setLoading(false);
        } else {
            loadGames();
        }
    }, [specificGame]);

    const loadGames = async () => {
        try {
            console.log('Fetching games...');
            const gamesData = await fetchGames();
            console.log('Games data:', gamesData);
            setGames(gamesData);
            setLoading(false);
        } catch (err) {
            console.error('Error in loadGames:', err);
            setError('Failed to load games');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={games}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.gameItem}>
                        <Text style={styles.gameTitle}>{item.name}</Text>
                        <Text style={styles.gameDescription}>{item.description}</Text>
                        <Text style={styles.gameCategory}>Category: {item.category}</Text>
                        {item.price && <Text style={styles.gamePrice}>Price: ${item.price}</Text>}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    gameTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    gameDescription: {
        fontSize: 14,
        color: '#666',
    },
    error: {
        color: 'red',
        fontSize: 16,
    },
    gameCategory: {
        fontSize: 14,
        color: '#444',
        marginTop: 4,
    },
    gamePrice: {
        fontSize: 14,
        color: '#2c5282',
        marginTop: 4,
    },
});

export default GamesScreen; 