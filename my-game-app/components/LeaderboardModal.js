import React from 'react';
import { 
    Modal, 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView 
} from 'react-native';

const LeaderboardModal = ({ visible, onClose, currentTeam, teams, showCompletionTime = false }) => {
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.title}>Leaderboard</Text>
                    
                    <ScrollView style={styles.scrollView}>
                        {teams.map((team, index) => (
                            <View 
                                key={team.name} 
                                style={[
                                    styles.teamRow,
                                    team.name === currentTeam && styles.currentTeamRow
                                ]}
                            >
                                <Text style={styles.rank}>#{index + 1}</Text>
                                <Text style={styles.teamName}>{team.name}</Text>
                                <View style={styles.scoreContainer}>
                                    <Text style={styles.score}>{team.score} pts</Text>
                                    {showCompletionTime && (
                                        <Text style={styles.time}>{formatTime(team.completionTime)}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={onClose}
                    >
                        <Text style={styles.continueButtonText}>Continue Playing</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FF8CB2'
    },
    scrollView: {
        width: '100%',
        marginBottom: 20
    },
    teamRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        width: '100%'
    },
    currentTeamRow: {
        backgroundColor: '#FFE5ED'
    },
    rank: {
        width: 30,
        fontWeight: 'bold',
        fontSize: 16
    },
    teamName: {
        flex: 1,
        fontSize: 16,
        marginHorizontal: 10
    },
    score: {
        width: 60,
        textAlign: 'right',
        fontSize: 16,
        fontWeight: 'bold'
    },
    continueButton: {
        backgroundColor: '#FF8CB2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 10
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    time: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});

export default LeaderboardModal; 