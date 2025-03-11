import { db } from './firebase.js';
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const generateCodeBtn = document.querySelector('.generate-code');
    const modal = document.getElementById('generate-code-modal');
    const closeBtn = document.getElementById('close-generate-modal');
    const generateBtn = document.getElementById('generate-code-btn');
    const gameSelect = document.getElementById('game-select');
    const codeContainer = document.getElementById('generated-code-container');
    const codeDisplay = document.getElementById('game-code');
    const copyBtn = document.getElementById('copy-code');

    // Function to generate a random 6-digit code
    function generateRandomCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Function to check if code already exists
    async function isCodeUnique(code) {
        const codesRef = collection(db, 'gameCodes');
        const q = query(codesRef, where('code', '==', code));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    }

    // Function to generate a unique code and save it to Firestore
    async function generateUniqueCode(gameId) {
        let code;
        let isUnique = false;
        
        while (!isUnique) {
            code = generateRandomCode();
            isUnique = await isCodeUnique(code);
        }

        const codesRef = collection(db, 'gameCodes');
        await addDoc(codesRef, {
            code: code,
            gameId: gameId,
            createdAt: new Date(),
            isValid: true
        });

        return code;
    }

    // Populate game select dropdown
    async function populateGameSelect() {
        try {
            console.log('Fetching games from Firestore...');
            const gamesRef = collection(db, 'games');
            // Create a query to get only active games
            const q = query(gamesRef, where('status', '==', 'active'));
            const querySnapshot = await getDocs(q);
            
            console.log('Number of active games found:', querySnapshot.size);
            
            gameSelect.innerHTML = '<option value="">Select a game...</option>';
            
            if (querySnapshot.empty) {
                console.log('No active games found in the database');
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No active games available";
                gameSelect.appendChild(option);
                return;
            }

            querySnapshot.forEach((doc) => {
                const game = doc.data();
                console.log('Game data:', game);
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = game.name;
                gameSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error populating games:', error);
            alert('Error loading games. Please try again.');
        }
    }

    // Event Listeners
    generateCodeBtn.addEventListener('click', () => {
        console.log('Generate code button clicked');
        modal.classList.remove('hidden');
        populateGameSelect();
        codeContainer.classList.add('hidden');
    });

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Close button clicked');
        modal.classList.add('hidden');
        gameSelect.value = '';
        codeContainer.classList.add('hidden');
    });

    generateBtn.addEventListener('click', async (e) => {
        console.log('Generate button clicked');
        const selectedGameId = gameSelect.value;
        if (!selectedGameId) {
            alert('Please select a game first');
            return;
        }

        try {
            const code = await generateUniqueCode(selectedGameId);
            codeDisplay.textContent = code;
            codeContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error generating code:', error);
            alert('Error generating code. Please try again.');
        }
    });

    copyBtn.addEventListener('click', () => {
        console.log('Copy button clicked');
        navigator.clipboard.writeText(codeDisplay.textContent)
            .then(() => alert('Code copied to clipboard!'))
            .catch(err => console.error('Failed to copy code:', err));
    });
}); 