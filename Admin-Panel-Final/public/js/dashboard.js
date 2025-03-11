// Import Firebase dependencies
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Global variables
let currentGames = [];
let currentContent = [];
let currentFilter = "active";

/* -------------------------- Firestore Operations -------------------------- */

// Fetch all games from Firestore
async function fetchGames() {
  const gamesCollection = collection(db, "games");
  const gameSnapshot = await getDocs(gamesCollection);
  currentGames = gameSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return currentGames;
}

// Update a game in Firestore
async function updateGame(gameId, data) {
  const gameDoc = doc(db, "games", gameId);
  await updateDoc(gameDoc, data);
}

// Delete a game from Firestore
async function deleteGame(gameId) {
  const gameDoc = doc(db, "games", gameId);
  await deleteDoc(gameDoc);
}

// Add a new game to Firestore
async function createGame(data) {
  const gamesCollection = collection(db, "games");
  await addDoc(gamesCollection, data);
}

async function fetchContentFromCollections() {
  const collections = ["puzzle", "quest", "quiz"]; // Changed 'quests' to 'quest'
  currentContent = []; // Reset current content

  try {
    for (const col of collections) {
      const collectionRef = collection(db, col);
      const snapshot = await getDocs(collectionRef);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: col, // Store the collection type
        ...doc.data(),
      }));
      currentContent = currentContent.concat(items);
    }

    populateContentDropdown(currentContent);
  } catch (error) {
    console.error("Error fetching content from collections:", error);
  }
}

function populateContentDropdown(content) {
  const contentDropdown = document.getElementById("game-content");
  contentDropdown.innerHTML = ""; // Clear existing options

  content.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;

    // Get the appropriate description based on content type
    let description;
    if (item.type === "quiz") {
      description = item.question || "No question";
    } else {
      description = item.description || "No description";
    }

    // Format the option text as "TYPE: Description"
    option.textContent = `${item.type.toUpperCase()}: ${description}`;
    contentDropdown.appendChild(option);
  });
}

/* ------------------------------ UI Rendering ------------------------------ */
function renderGames(games) {
  const gameList = document.getElementById("game-list");
  gameList.innerHTML = ""; // Clear existing content

  // Filter games based on current filter
  const filteredGames = games.filter((game) => {
    if (currentFilter === "active") {
      return game.status === "active";
    } else {
      return game.status === "inactive";
    }
  });

  filteredGames.forEach((game) => {
    const gameCard = document.createElement("div");
    gameCard.classList.add("game-card");

    // Generate content display with descriptions
    const contentDisplay = game.content
      ? game.content
          .map((item) => {
            // Find the content details from the respective collection
            const contentDetails = currentContent.find(
              (content) => content.id === item.id && content.type === item.type
            );

            let description = "Content not found";
            if (contentDetails) {
              if (item.type === "quiz") {
                description = contentDetails.question || "No question";
              } else {
                description = contentDetails.description || "No description";
              }
            }

            return `
                <li>
                  <strong>${item.type.toUpperCase()}:</strong> 
                  ${description}
                </li>`;
          })
          .join("")
      : "<li>No content assigned</li>";

    gameCard.innerHTML = `
      <h3>${game.name}</h3>
      <div class="game-id">#${game.id}</div>
      <div class="game-info">
        <label>
          Shuffle Content:
          <input type="checkbox" ${
            game.shuffleContent ? "checked" : ""
          } disabled />
        </label>
        <label>
          Active:
          <input type="checkbox" ${
            game.status === "active" ? "checked" : ""
          } disabled />
        </label>
      </div>
      <div class="associated-content">
        <h4>Associated Content:</h4>
        <ul>
          ${contentDisplay}
        </ul>
      </div>
      <div class="card-actions">
        <button class="details-btn" data-id="${game.id}">Details</button>
        <button class="edit-btn" data-id="${game.id}">Edit</button>
        <button class="delete-btn" data-id="${game.id}">Delete</button>
      </div>
    `;

    gameList.appendChild(gameCard);
  });

  // Add event listeners to buttons
  document.querySelectorAll(".details-btn").forEach((button) => {
    button.addEventListener("click", () => showGameDetails(button.dataset.id));
  });
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => showEditModal(button.dataset.id));
  });
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => handleDeleteGame(button.dataset.id));
  });
}

// Add tab switching functionality
function setupTabHandlers() {
  const tabs = document.querySelectorAll(".game-tabs button:not(.create):not(.generate-code)");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      switchTab(tab.textContent);
    });
  });
}

/* ---------------------------- Modal Management ---------------------------- */
function populateContentTypeDropdown(contentType, selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Select a content</option>'; // Add default option

  const filteredContent = currentContent.filter(
    (item) => item.type === contentType
  );

  filteredContent.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;

    // Get the appropriate description based on content type
    let description;
    if (item.type === "quiz") {
      description = item.question || "No question";
    } else if (item.type === "quest") {
      description = item.title || item.description || "No quest title";
    } else {
      description = item.description || "No description";
    }

    // Remove the ID from the display text
    option.textContent = description;
    select.appendChild(option);
  });
}

async function showEditModal(gameId) {
  const modal = document.getElementById("edit-modal");
  modal.classList.remove("hidden");

  // Fetch game data and pre-fill the form
  const game = currentGames.find((g) => g.id === gameId);
  if (!game) {
    alert("Game not found!");
    return;
  }

  // Store the game ID for the submit handler
  modal.dataset.gameId = gameId;

  // Fill in basic game information
  document.getElementById("edit-game-name").value = game.name;
  document.getElementById("edit-shuffle-content").checked = game.shuffleContent;
  document.getElementById("edit-game-status").value = game.status;

  // Populate the separate content type dropdowns
  populateContentTypeDropdown("puzzle", "edit-select-puzzle");
  populateContentTypeDropdown("quest", "edit-select-quest");
  populateContentTypeDropdown("quiz", "edit-select-quiz");

  // Pre-select the current content if any
  if (game.content) {
    // Group content by type
    const contentByType = {
      puzzle: game.content.filter((c) => c.type === "puzzle"),
      quest: game.content.filter((c) => c.type === "quest"),
      quiz: game.content.filter((c) => c.type === "quiz"),
    };

    // Set selected options for each type
    Object.entries(contentByType).forEach(([type, contents]) => {
      const select = document.getElementById(`edit-select-${type}`);
      if (select) {
        // Clear all selections first
        Array.from(select.options).forEach((opt) => (opt.selected = false));

        // Select the appropriate options
        contents.forEach((content) => {
          const option = Array.from(select.options).find(
            (opt) => opt.value === content.id
          );
          if (option) {
            option.selected = true;
          }
        });
      }
    });
  }
}

async function handleEditFormSubmit(event) {
  event.preventDefault();

  const modal = document.getElementById("edit-modal");
  const gameId = modal.dataset.gameId;

  // Get form values
  const name = document.getElementById("edit-game-name").value;
  const shuffleContent = document.getElementById(
    "edit-shuffle-content"
  ).checked;
  const status = document.getElementById("edit-game-status").value;

  // Get selected content from all dropdowns using Array.from to handle multiple selections
  const selectedContent = [];

  // Get selected puzzles
  const puzzleSelect = document.getElementById("edit-select-puzzle");
  Array.from(puzzleSelect.selectedOptions).forEach((option) => {
    selectedContent.push({ id: option.value, type: "puzzle" });
  });

  // Get selected quests
  const questSelect = document.getElementById("edit-select-quest");
  Array.from(questSelect.selectedOptions).forEach((option) => {
    selectedContent.push({ id: option.value, type: "quest" });
  });

  // Get selected quizzes
  const quizSelect = document.getElementById("edit-select-quiz");
  Array.from(quizSelect.selectedOptions).forEach((option) => {
    selectedContent.push({ id: option.value, type: "quiz" });
  });

  try {
    await updateGame(gameId, {
      name,
      shuffleContent,
      status,
      content: selectedContent,
      updatedAt: new Date().toISOString()
    });

    alert("Game updated successfully!");
    hideEditModal();
    await fetchGames().then(renderGames);
  } catch (error) {
    console.error("Error updating game:", error);
    alert("Failed to update the game. Please try again.");
  }
}

// Handle deleting a game
async function handleDeleteGame(gameId) {
  if (!confirm("Are you sure you want to delete this game?")) return;

  try {
    await deleteGame(gameId);
    console.log("Game deleted successfully.");
    await fetchGames().then(renderGames);
  } catch (error) {
    console.error("Error deleting game:", error);
    alert("Failed to delete the game.");
  }
}

async function handleCreateForm(event) {
  event.preventDefault();

  // Get form values
  const name = document.getElementById("game-name").value;
  const gameId = document.getElementById("game-id").value;
  const shuffleContent = document.getElementById("shuffle-content").checked;
  const status = document.getElementById("game-status").value;

  // Get selected content
  const selectedContent = Array.from(
    document.getElementById("game-content").selectedOptions
  ).map((option) => {
    const type = option.textContent.split(":")[0].toLowerCase().trim();
    // Convert 'quests' to 'quest' if needed
    const normalizedType = type === "quests" ? "quest" : type;
    return {
      id: option.value,
      type: normalizedType,
    };
  });

  try {
    // Add game to Firestore
    const gamesCollection = collection(db, "games");
    await addDoc(gamesCollection, {
      name,
      gameId,
      shuffleContent,
      status,
      content: selectedContent,
      updatedAt: new Date().toISOString()
    });

    // Hide modal and refresh the game list
    hideCreateModal();
    await fetchGames().then(renderGames);

    alert("Game created successfully!");
  } catch (error) {
    console.error("Error creating game:", error);
    alert("Failed to create the game. Please try again.");
  }
}

// Add this new function after the other modal management functions
function populateGameSelectDropdown() {
  const gameSelect = document.getElementById('game-select');
  gameSelect.innerHTML = '<option value="">Select a game</option>'; // Add default option

  // Filter only active games
  const activeGames = currentGames.filter(game => game.status === 'active');

  activeGames.forEach(game => {
    const option = document.createElement('option');
    option.value = game.id;
    option.textContent = `${game.name} (#${game.gameId})`;
    gameSelect.appendChild(option);
  });
}

/* ------------------------------- Initialization ------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  // Setup tab handlers
  setupTabHandlers();

  // Attach event listeners for modal buttons
  document.querySelector(".create").addEventListener("click", showCreateModal);
  document
    .getElementById("close-modal")
    .addEventListener("click", hideCreateModal);
  document
    .getElementById("create-form")
    .addEventListener("submit", handleCreateForm);
  document
    .getElementById("close-edit-modal")
    .addEventListener("click", hideEditModal);

  // Add this line to handle edit form submission
  document
    .getElementById("edit-form")
    .addEventListener("submit", handleEditFormSubmit);

  // Add event listener for generate code button
  document.querySelector('.generate-code').addEventListener('click', () => {
    document.getElementById('generate-code-modal').classList.remove('hidden');
    populateGameSelectDropdown();
    // Make sure we stay on the active tab
    switchTab('active');
  });

  try {
    // First fetch all content
    await fetchContentFromCollections();

    // Then fetch and display games
    const games = await fetchGames();
    currentGames = games;
    renderGames(games);
  } catch (err) {
    console.error("Error initializing dashboard:", err);
  }

  // Add click outside modal to close functionality
  window.addEventListener("click", (event) => {
    const detailsModal = document.getElementById("details-modal");
    if (event.target === detailsModal) {
      hideDetailsModal();
    }
  });
});

async function showGameDetails(gameId) {
  const game = currentGames.find((g) => g.id === gameId);
  if (!game) {
    alert("Game not found!");
    return;
  }

  const modal = document.getElementById("details-modal");
  const container = document.getElementById("game-details-container");

  let detailsHTML = `
    <div class="content-details">
      <div class="detail-row">
        <strong>Game Name:</strong>
        <span>${game.name}</span>
      </div>
      
      <div class="detail-row">
        <strong>Game ID:</strong>
        <span>${game.gameId}</span>
      </div>

      <div class="detail-row">
        <strong>Status:</strong>
        <span>${game.status}</span>
      </div>

      <div class="detail-row">
        <strong>Shuffle Content:</strong>
        <span>${game.shuffleContent ? "Yes" : "No"}</span>
      </div>

      <div class="detail-row">
        <strong>Associated Content:</strong>
        <div class="detail-content-list">
  `;

  if (game.content && game.content.length > 0) {
    detailsHTML += '<ul>';
    for (const item of game.content) {
      const contentDetails = currentContent.find(
        content => content.id === item.id && content.type === item.type
      );

      if (contentDetails) {
        let description;
        if (item.type === "quiz") {
          description = contentDetails.question || "No question";
        } else if (item.type === "quest") {
          description = contentDetails.title || contentDetails.description || "No quest title";
        } else {
          description = contentDetails.description || "No description";
        }

        detailsHTML += `
          <li>
            <strong>${item.type.toUpperCase()}:</strong> ${description}
          </li>
        `;
      }
    }
    detailsHTML += '</ul>';
  } else {
    detailsHTML += '<p>No content associated with this game.</p>';
  }

  detailsHTML += `
        </div>
      </div>

      <div class="detail-row">
        <strong>Last Updated:</strong>
        <span>${game.updatedAt ? new Date(game.updatedAt).toLocaleString() : 'Not available'}</span>
      </div>
    </div>
  `;

  container.innerHTML = detailsHTML;
  modal.classList.remove("hidden");

  // Only add the close button event listener
  document.getElementById("close-details-modal").onclick = hideDetailsModal;
}

function hideDetailsModal() {
  const modal = document.getElementById("details-modal");
  modal.classList.add("hidden");
}

// Add these functions back
function hideEditModal() {
  const modal = document.getElementById("edit-modal");
  if (modal) {
    modal.classList.add("hidden");
  } else {
    console.error("Edit modal element not found");
  }
}

function showCreateModal() {
  const modal = document.getElementById("create-modal");
  modal.classList.remove("hidden");
}

function hideCreateModal() {
  const modal = document.getElementById("create-modal");
  modal.classList.add("hidden");
}

// Add this new function to handle tab switching
function switchTab(tabName) {
  const tabs = document.querySelectorAll(".game-tabs button:not(.create):not(.generate-code)");
  tabs.forEach((t) => t.classList.remove("active"));
  
  // Find and activate the correct tab
  tabs.forEach((tab) => {
    if (tab.textContent.toLowerCase().trim() === tabName.toLowerCase()) {
      tab.classList.add("active");
    }
  });

  // Update current filter
  currentFilter = tabName.toLowerCase();

  // Re-render games with new filter
  renderGames(currentGames);
}
