import { db, rtdb } from "./firebase.js";
import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  deleteDoc,
  getDoc 
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

// Function to show game code input
function showGameCodeInput() {
  const reportSection = document.querySelector('.report-section');
  reportSection.innerHTML = `
    <div class="game-code-input">
      <h2>Enter Game Code</h2>
      <input type="text" id="gameCodeInput" placeholder="Enter game code...">
      <button id="submitGameCode">View Leaderboard</button>
      <p class="error-message" style="color: red; display: none;"></p>
    </div>
  `;

  // Add event listener to the submit button
  document.getElementById('submitGameCode').addEventListener('click', handleGameCodeSubmit);
  
  // Add enter key support
  document.getElementById('gameCodeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleGameCodeSubmit();
    }
  });
}

// Function to handle game code submission
async function handleGameCodeSubmit() {
  const gameCode = document.getElementById('gameCodeInput').value.trim();
  const errorMessage = document.querySelector('.error-message');
  
  if (!gameCode) {
    errorMessage.textContent = 'Please enter a game code';
    errorMessage.style.display = 'block';
    return;
  }

  try {
    const gameRef = ref(rtdb, `gameScores/${gameCode}`);
    const snapshot = await get(gameRef);
    
    if (snapshot.exists()) {
      const teams = snapshot.val();
      displayLeaderboard(formatTeamData(teams), gameCode);
    } else {
      errorMessage.textContent = 'Invalid game code. Please try again.';
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    console.error("Error fetching game data:", error);
    errorMessage.textContent = 'Error loading game data. Please try again.';
    errorMessage.style.display = 'block';
  }
}

// Function to format team data
function formatTeamData(teams) {
  return Object.entries(teams)
    .filter(([key, _]) => key !== 'timestamp') // Filter out non-team entries
    .map(([teamKey, teamData]) => ({
      name: teamData.name || `Team ${teamKey}`,
      score: teamData.score || 0,
      completionTime: teamData.completionTime || 0
    }));
}

// Function to display leaderboard
function displayLeaderboard(teams, gameId) {
  const reportSection = document.querySelector('.report-section');
  
  // Add back button
  const backButton = document.createElement('button');
  backButton.textContent = '← Back to Game Code';
  backButton.className = 'back-button';
  backButton.onclick = showGameCodeInput;
  
  // Create table
  const table = document.createElement('table');
  table.className = 'results-table';
  
  // Sort teams by completion time (fastest first)
  teams.sort((a, b) => {
    // Handle cases where completionTime might be undefined or 0
    if (!a.completionTime) return 1;  // Push undefined/0 times to the end
    if (!b.completionTime) return -1;
    return a.completionTime - b.completionTime;  // Sort ascending (fastest first)
  });
  
  // Add table headers
  table.innerHTML = `
    <thead>
      <tr>
        <th>Rank</th>
        <th>Team Name</th>
        <th>Score</th>
        <th>Completion Time (seconds)</th>
      </tr>
    </thead>
    <tbody>
      ${teams.map((team, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${team.name}</td>
          <td>${team.score}</td>
          <td>${team.completionTime || 'Not completed'}</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  // Clear and update content
  reportSection.innerHTML = '';
  reportSection.appendChild(backButton);
  reportSection.appendChild(table);
  
  // Store gameId for later use
  reportSection.dataset.gameId = gameId;
}

// Function to export leaderboard and delete data
async function exportAndDeleteLeaderboard() {
  const reportSection = document.querySelector('.report-section');
  const resultsTable = reportSection.querySelector('.results-table');
  const gameId = reportSection.dataset.gameId;
  
  if (!resultsTable || !gameId) {
    alert('No data to export');
    return;
  }

  // Create PDF content
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Game Leaderboard</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #00bf9a;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f5f5f5;
          }
          .export-header {
            margin-bottom: 20px;
          }
          .export-date {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="export-header">
          <h1>Game Leaderboard</h1>
          <div class="export-date">
            Generated on: ${new Date().toLocaleString()}
          </div>
          <div>Game Code: ${gameId}</div>
        </div>
        ${resultsTable.outerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = async function() {
    printWindow.print();
    
    try {
      // Delete from Realtime Database (gameScores collection)
      const gameScoresRef = ref(rtdb, `gameScores/${gameId}`);
      await remove(gameScoresRef);
      console.log("Deleted from Realtime Database (gameScores)");

      // Delete from Firestore (gameCodes collection)
      try {
        const gameCodesCollection = collection(db, 'gameCodes');
        // Add quotes to match the exact string format in Firestore
        const q = query(gameCodesCollection, where('code', '==', `"${gameId}"`));
        const querySnapshot = await getDocs(q);
        
        console.log("Searching for code:", `"${gameId}"`); // Debug log
        
        if (!querySnapshot.empty) {
          const docToDelete = querySnapshot.docs[0];
          console.log("Found document with ID:", docToDelete.id); // Debug log
          await deleteDoc(doc(db, 'gameCodes', docToDelete.id));
          console.log("Deleted from Firestore (gameCodes)");
        } else {
          // Try without quotes as fallback
          const q2 = query(gameCodesCollection, where('code', '==', gameId));
          const querySnapshot2 = await getDocs(q2);
          
          if (!querySnapshot2.empty) {
            const docToDelete = querySnapshot2.docs[0];
            console.log("Found document with ID (without quotes):", docToDelete.id); // Debug log
            await deleteDoc(doc(db, 'gameCodes', docToDelete.id));
            console.log("Deleted from Firestore (gameCodes)");
          } else {
            console.log("No matching document found in Firestore gameCodes collection");
            console.log("Searched for codes:", `"${gameId}"`, "and", gameId);
          }
        }
      } catch (firestoreError) {
        console.error("Firestore deletion error:", firestoreError);
      }

      console.log("Game data deleted successfully from both databases");
      showGameCodeInput();
    } catch (error) {
      console.error("Error during deletion:", error);
      alert('Error deleting game data. Please try again.');
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // Cancel button
  const cancelBtn = document.querySelector('.cancel-btn');
  cancelBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Export button
  const exportBtn = document.querySelector('.export-btn');
  exportBtn.addEventListener('click', exportAndDeleteLeaderboard);

  // Show initial game code input
  showGameCodeInput();
});
  