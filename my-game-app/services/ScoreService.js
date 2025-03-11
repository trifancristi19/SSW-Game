import { ref, onValue, set, remove, get, runTransaction, update } from 'firebase/database';
import { realtimeDb } from '../firebase';

class ScoreService {
    constructor() {
        this.gameCode = null;
        this.scoresRef = null;
        this.listener = null;
    }

    async initialize(gameCode) {
        this.gameCode = gameCode;
        this.scoresRef = ref(realtimeDb, `gameScores/${gameCode}`);
        
        // Initialize scores if they don't exist
        const snapshot = await get(this.scoresRef);
        if (!snapshot.exists()) {
            await set(this.scoresRef, {});
        }
    }

    startPolling(onScoresUpdate) {
        // Remove any existing listener
        if (this.listener) {
            this.listener();
        }

        // Use Firebase real-time updates with error handling
        this.listener = onValue(this.scoresRef, (snapshot) => {
            try {
                const scoresObj = snapshot.val() || {};
                const scoresArray = Object.values(scoresObj)
                    .filter(score => score && score.name && score.score !== undefined)
                    .sort((a, b) => b.score - a.score); // Sort by score in descending order
                
                console.log('Updated scores:', scoresArray); // Debug log
                onScoresUpdate(scoresArray);
            } catch (error) {
                console.error('Error processing scores update:', error);
            }
        }, (error) => {
            console.error('Error in score polling:', error);
        });
    }

    stopPolling() {
        if (this.listener) {
            this.listener();
            this.listener = null;
        }
    }

    async updateScore(teamName, newScore) {
        if (!this.gameCode || !teamName) {
            console.error('Missing gameCode or teamName');
            return;
        }

        try {
            const teamRef = ref(realtimeDb, `gameScores/${this.gameCode}/${teamName.replace(/[.#$\/\[\]]/g, '_')}`);
            await set(teamRef, {
                name: teamName,
                score: newScore,
                lastUpdate: Date.now()
            });
            console.log(`Score updated for ${teamName}: ${newScore}`); // Debug log
        } catch (error) {
            console.error('Error updating score:', error);
            throw error;
        }
    }

    async getScores() {
        if (!this.gameCode) return [];

        try {
            const snapshot = await get(this.scoresRef);
            const scoresObj = snapshot.val() || {};
            return Object.values(scoresObj);
        } catch (error) {
            console.error('Error getting scores:', error);
            return [];
        }
    }

    async clearScores() {
        if (!this.gameCode) return;
        try {
            await remove(this.scoresRef);
        } catch (error) {
            console.error('Error clearing scores:', error);
        }
    }

    // Add this method for debugging
    async debugScores() {
        const snapshot = await get(this.scoresRef);
        console.log('Current scores in DB:', snapshot.val());
    }

    async updateScoreWithTime(gameCode, teamName, score, completionTime = null) {
        if (!gameCode || !teamName) return;
        
        const updates = {
            name: teamName,
            score: score,
            lastUpdate: Date.now()
        };
        
        if (completionTime !== null) {
            updates.completionTime = completionTime;
        }

        const teamRef = ref(realtimeDb, `gameScores/${gameCode}/${teamName.replace(/[.#$\/\[\]]/g, '_')}`);
        await update(teamRef, updates);
    }

    async getCompletedTeams(gameCode) {
        try {
            const scoresRef = ref(realtimeDb, `gameScores/${gameCode}`);
            const snapshot = await get(scoresRef);
            
            if (!snapshot.exists()) {
                console.log('No data exists for game code:', gameCode);
                return [];
            }

            const teams = [];
            const scoresData = snapshot.val();
            
            Object.entries(scoresData).forEach(([key, data]) => {
                if (data.completionTime) {
                    teams.push({
                        name: data.name,
                        score: data.score,
                        completionTime: data.completionTime
                    });
                }
            });

            console.log(`Found ${teams.length} completed teams for game ${gameCode}`);
            
            // Sort by completion time (fastest first)
            return teams.sort((a, b) => a.completionTime - b.completionTime);
        } catch (error) {
            console.error('Error getting completed teams:', error);
            return [];
        }
    }
}

const scoreService = new ScoreService();
export default scoreService; 