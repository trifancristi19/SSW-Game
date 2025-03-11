import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Global variables to store content
let currentContent = {
  puzzle: [],
  quest: [],
  quiz: [],
};

/* -------------------------- Firestore Operations -------------------------- */

// Fetch content from all collections
async function fetchContent() {
  try {
    const collections = ["puzzle", "quest", "quiz"];
    for (const collectionName of collections) {
      const contentCollection = collection(db, collectionName);
      const snapshot = await getDocs(contentCollection);
      currentContent[collectionName] = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: collectionName,
        ...doc.data(),
      }));
    }
    return getAllContent();
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}

// Get all content combined
function getAllContent() {
  return [
    ...currentContent.puzzle,
    ...currentContent.quest,
    ...currentContent.quiz,
  ];
}

// Create new content
async function createContent(type, data) {
  const contentCollection = collection(db, type);
  await addDoc(contentCollection, data);
}

// Update content
async function updateContent(type, contentId, data) {
  const contentDoc = doc(db, type, contentId);
  await updateDoc(contentDoc, data);
}

// Delete content
async function deleteContent(type, contentId) {
  const contentDoc = doc(db, type, contentId);
  await deleteDoc(contentDoc);
}

/* ------------------------------ UI Rendering ------------------------------ */

function renderContent(contentItems) {
  const contentList = document.getElementById("content-list");
  contentList.innerHTML = ""; // Clear existing content

  contentItems.forEach((item) => {
    const contentCard = document.createElement("div");
    contentCard.classList.add("content-card");

    let contentHTML = "";
    if (item.type === "quiz") {
      contentHTML = `
        <div class="content-id">#${item.id}</div>
        <p class="content-type">${item.type.toUpperCase()}</p>
        <div class="content-description">
          <strong>Question:</strong> ${item.question || "No question"}
        </div>
        <div class="choices">
          <strong>Choices:</strong>
          <ul>
            ${
              item.choices
                ?.map(
                  (choice) =>
                    `<li>${choice.text} ${
                      choice.isCorrect ? "(Correct)" : ""
                    }</li>`
                )
                .join("") || "No choices"
            }
          </ul>
        </div>
        <div class="points-value">
          <strong>Points:</strong> ${item.pointsValue || 0}
        </div>
        <div class="features">
          <div>Location Tracking: ${item.locationTracking ? "✓" : "✗"}</div>
          <div>GPS Tracking: ${item.gpsTracking ? "✓" : "✗"}</div>
        </div>
      `;
    } else if (item.type === "puzzle") {
      contentHTML = `
        <div class="content-id">#${item.id}</div>
        <p class="content-type">${item.type.toUpperCase()}</p>
        <div class="content-description">
          <strong>Description:</strong> ${item.description || "No description"}
        </div>
        <div class="points-value">
          <strong>Points:</strong> ${item.pointsValue || 0}
        </div>
        <div class="features">
          <div>Location Tracking: ${item.locationTracking ? "✓" : "✗"}</div>
          <div>GPS Tracking: ${item.gpsTracking ? "✓" : "✗"}</div>
        </div>
      `;
    } else {
      contentHTML = `
        <div class="content-id">#${item.id}</div>
        <p class="content-type">${item.type.toUpperCase()}</p>
        <div class="content-description">
          <strong>Description:</strong> ${item.description || "No description"}
        </div>
        <div class="points-value">
          <strong>Points:</strong> ${item.pointsValue || 0}
        </div>
        <div class="features">
          <div>Object Recognition: ${item.objectRecognition ? "✓" : "✗"}</div>
          <div>Location Tracking: ${item.locationTracking ? "✓" : "✗"}</div>
          <div>GPS Tracking: ${item.gpsTracking ? "✓" : "✗"}</div>
        </div>
      `;
    }

    contentHTML += `
      <div class="card-actions">
        <button class="details-btn" data-id="${item.id}" data-type="${item.type}">Details</button>
        <button class="edit-btn" data-id="${item.id}" data-type="${item.type}">Edit</button>
        <button class="delete-btn" data-id="${item.id}" data-type="${item.type}">Delete</button>
      </div>
    `;

    contentCard.innerHTML = contentHTML;
    contentList.appendChild(contentCard);
  });

  // Add event listeners after all cards are added to the DOM
  attachEventListeners();
}

// Separate function to attach event listeners
function attachEventListeners() {
  // Add event listeners to buttons
  document.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      showContentDetails(btn.dataset.type, btn.dataset.id)
    );
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const type = e.target.dataset.type;
      const id = e.target.dataset.id;
      showEditModal(type, id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      handleDeleteContent(btn.dataset.type, btn.dataset.id)
    );
  });
}

/* ---------------------------- Modal Management ---------------------------- */

function showContentModal(type) {
  const modal = document.getElementById("content-modal");
  const questForm = document.getElementById("quest-form");
  const puzzleForm = document.getElementById("puzzle-form");
  const quizForm = document.getElementById("quiz-form");
  const title = document.getElementById("content-modal-title");

  title.textContent = `Create New ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;
  modal.classList.remove("hidden");
  modal.dataset.contentType = type;
  modal.dataset.contentId = ""; // Reset contentId

  // Reset all forms
  questForm.reset();
  puzzleForm.reset();
  quizForm.reset();

  // Show appropriate form and reset it
  if (type === "quiz") {
    questForm.classList.add("hidden");
    puzzleForm.classList.add("hidden");
    quizForm.classList.remove("hidden");

    // Clear choices container and add one empty choice
    const choicesContainer = document.getElementById("choices-container");
    choicesContainer.innerHTML = `
      <div class="choice-item">
        <input type="radio" name="correct-answer" value="0" required>
        <input type="text" class="choice-input" placeholder="The main content of the Choice..." required>
        <button type="button" class="remove-choice">×</button>
      </div>
    `;

    setupQuizForm();
  } else if (type === "puzzle") {
    questForm.classList.add("hidden");
    puzzleForm.classList.remove("hidden");
    quizForm.classList.add("hidden");
    // Clear existing images container
    const imageContainer = document.getElementById("image-choices-container");
    imageContainer.innerHTML = "";
    // Add one empty image choice item
    const choiceItem = createImageChoiceItem();
    imageContainer.appendChild(choiceItem);
    initializeImageItem(choiceItem);
    setupPuzzleForm();
  } else if (type === "quest") {
    questForm.classList.remove("hidden");
    puzzleForm.classList.add("hidden");
    quizForm.classList.add("hidden");
    setupQuestForm();
  }
}

function hideContentModal() {
  const modal = document.getElementById("content-modal");
  const imageContainer = document.getElementById("image-choices-container");
  const puzzleForm = document.getElementById("puzzle-form");
  const questForm = document.getElementById("quest-form");
  const quizForm = document.getElementById("quiz-form");

  // Reset all forms
  if (puzzleForm) puzzleForm.reset();
  if (questForm) questForm.reset();
  if (quizForm) {
    quizForm.reset();
    // Clear choices container and add one empty choice
    const choicesContainer = document.getElementById("choices-container");
    choicesContainer.innerHTML = `
      <div class="choice-item">
        <input type="radio" name="correct-answer" value="0" required>
        <input type="text" class="choice-input" placeholder="The main content of the Choice..." required>
        <button type="button" class="remove-choice">×</button>
      </div>
    `;
  }

  // Reset location tracking related elements
  document.getElementById("location-tracking").checked = false;
  document.getElementById("room-select").classList.add("hidden");
  // Reset GPS tracking related elements
  document.getElementById("gps-tracking").checked = false;
  document.getElementById("location-select").classList.add("hidden");

  // Clear images if exists
  if (imageContainer) {
    imageContainer.innerHTML = "";
  }

  modal.classList.add("hidden");
  modal.dataset.contentId = ""; // Reset contentId
}

async function showEditModal(type, contentId) {
  const modal = document.getElementById("content-modal");
  const questForm = document.getElementById("quest-form");
  const puzzleForm = document.getElementById("puzzle-form");
  const quizForm = document.getElementById("quiz-form");
  const title = document.getElementById("content-modal-title");

  // Find the content item
  const content = currentContent[type].find((item) => item.id === contentId);
  if (!content) return;

  title.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  modal.classList.remove("hidden");
  modal.dataset.contentType = type;
  modal.dataset.contentId = contentId;

  if (type === "puzzle") {
    questForm.classList.add("hidden");
    puzzleForm.classList.remove("hidden");
    quizForm.classList.add("hidden");

    // Fill puzzle form
    document.getElementById("content-description").value =
      content.description || "";
    document.getElementById("points-value").value = content.pointsValue || 0;
    document.getElementById("location-tracking").checked =
      content.locationTracking || false;
    document.getElementById("gps-tracking").checked =
      content.gpsTracking || false;

    // Clear existing images container
    const imageContainer = document.getElementById("image-choices-container");
    imageContainer.innerHTML = "";

    // Add existing images
    if (content.images && content.images.length > 0) {
      content.images.forEach((image, index) => {
        const choiceItem = createImageChoiceItem();
        imageContainer.appendChild(choiceItem);

        // Set up the image preview
        const previewImage = choiceItem.querySelector(".preview-image");
        const placeholderText = choiceItem.querySelector(".placeholder-text");

        previewImage.src = `http://localhost:3000${image.path}`;
        previewImage.classList.remove("hidden");
        placeholderText.classList.add("hidden");

        // Set the radio button if this was the correct answer
        const radioInput = choiceItem.querySelector('input[type="radio"]');
        radioInput.checked = image.isCorrect;

        // Store the path in the dataset
        choiceItem.dataset.imagePath = image.path;
      });
    }

    // Show room select if location tracking is enabled
    const roomSelect = document.getElementById("room-select");
    if (content.locationTracking) {
      roomSelect.classList.remove("hidden");
      roomSelect.value = content.room || "";
    }

    // Show location select if GPS tracking is enabled
    const locationSelect = document.getElementById("location-select");
    if (content.gpsTracking) {
      locationSelect.classList.remove("hidden");
      locationSelect.value = content.location || "";
    }

    setupPuzzleForm();
  } else if (type === "quiz") {
    questForm.classList.add("hidden");
    puzzleForm.classList.add("hidden");
    quizForm.classList.remove("hidden");

    // Fill quiz form
    document.getElementById("quiz-question").value = content.question || "";
    document.getElementById("quiz-points").value = content.pointsValue || 0;

    // Handle location tracking
    const locationTracking = document.getElementById("quiz-location-tracking");
    const roomSelect = document.getElementById("quiz-room-select");
    locationTracking.checked = content.locationTracking || false;
    if (content.locationTracking) {
      roomSelect.classList.remove("hidden");
      roomSelect.value = content.room || "";
    }

    // Handle GPS tracking
    const gpsTracking = document.getElementById("quiz-gps-tracking");
    const gpsLocation = document.getElementById("quiz-gps-location");
    gpsTracking.checked = content.gpsTracking || false;
    if (content.gpsTracking) {
      gpsLocation.classList.remove("hidden");
      gpsLocation.value = content.location || "";
    }

    // Clear existing choices
    const choicesContainer = document.getElementById("choices-container");
    choicesContainer.innerHTML = "";

    // Add existing choices
    content.choices?.forEach((choice, index) => {
      const choiceItem = document.createElement("div");
      choiceItem.className = "choice-item";

      choiceItem.innerHTML = `
            <input type="radio" name="correct-answer" value="${index}" ${
        choice.isCorrect ? "checked" : ""
      } required>
            <input type="text" class="choice-input" value="${
              choice.text
            }" placeholder="The main content of the Choice..." required>
            <button type="button" class="remove-choice">×</button>
        `;

      choicesContainer.appendChild(choiceItem);

      // Add remove button handler
      choiceItem
        .querySelector(".remove-choice")
        .addEventListener("click", () => {
          choiceItem.remove();
          updateChoiceValues();
        });
    });

    setupQuizForm();
  } else if (type === "quest") {
    questForm.classList.remove("hidden");
    puzzleForm.classList.add("hidden");
    quizForm.classList.add("hidden");

    // Fill quest form
    document.getElementById("quest-description").value =
      content.description || "";
    document.getElementById("quest-points").value = content.pointsValue || 0;

    // Handle object recognition
    const objectRecognition = document.getElementById(
      "quest-object-recognition"
    );
    const recognitionItem = document.getElementById("quest-recognition-item");

    // Fetch and populate objects dropdown
    const objects = await fetchObjectsForRecognition();
    recognitionItem.innerHTML = `
      ${objects
        .map((obj) => `<option value="${obj.id}">${obj.name}</option>`)
        .join("")}
    `;

    // Set the checkbox and show/hide the dropdown
    objectRecognition.checked = content.objectRecognition || false;
    if (content.objectRecognition) {
      recognitionItem.classList.remove("hidden");
      recognitionItem.value = content.recognitionItem || "";
    } else {
      recognitionItem.classList.add("hidden");
    }

    // Handle location tracking
    document.getElementById("quest-location-tracking").checked =
      content.locationTracking || false;
    const roomSelect = document.getElementById("quest-room-select");
    if (content.locationTracking) {
      roomSelect.classList.remove("hidden");
      roomSelect.value = content.room || "";
    }

    // Handle GPS tracking
    document.getElementById("quest-gps-tracking").checked =
      content.gpsTracking || false;
    const locationSelect = document.getElementById("quest-location-select");
    if (content.gpsTracking) {
      locationSelect.classList.remove("hidden");
      locationSelect.value = content.location || "";
    }

    // Setup form event listeners without repopulating the dropdown
    setupQuestFormListeners();
  }

  // Handle dependent fields
  if (type === "quest" || type === "puzzle") {
    const recognitionItem = document.getElementById(`${type}-recognition-item`);
    if (content.objectRecognition) {
      recognitionItem.classList.remove("hidden");
      recognitionItem.value = content.recognitionItem || "";
    }
  }

  if (type === "quest" || type === "quiz") {
    const locationSelect =
      type === "quest"
        ? document.getElementById("quest-location-select")
        : document.getElementById("quiz-location");

    if (content.gpsTracking) {
      locationSelect.classList.remove("hidden");
      locationSelect.value = content.location || "";
    }
  }
}

/* --------------------------- Event Handlers --------------------------- */

async function handleContentSubmit(event) {
  event.preventDefault();

  const modal = document.getElementById("content-modal");
  const contentId = modal.dataset.contentId;
  const type = modal.dataset.contentType;

  const formData = {
    description: document.getElementById("content-description").value,
    pointsValue: parseInt(document.getElementById("points-value").value),
    locationTracking: document.getElementById("location-tracking").checked,
    gpsTracking: document.getElementById("gps-tracking").checked,
    type: type,
    updatedAt: new Date().toISOString(),
  };

  // Add location data if tracking is enabled
  if (formData.locationTracking) {
    formData.room = document.getElementById("room-select").value;
  }

  if (formData.gpsTracking) {
    formData.location = document.getElementById("location-select").value;
  }

  // Handle image for puzzles
  if (type === "puzzle") {
    const imageItem = document.querySelector(".image-choice-item");
    const fileInput = imageItem.querySelector(".file-input");
    const file = fileInput.files[0];

    if (contentId) {
      // If editing and no new file is selected, keep the existing image
      if (!file && imageItem.dataset.imagePath) {
        formData.images = [
          {
            path: imageItem.dataset.imagePath,
            isCorrect: true,
            order: 0,
          },
        ];
      } else if (!file && !imageItem.dataset.imagePath) {
        alert("Please select an image for the puzzle");
        return;
      }
    } else if (!file) {
      // New puzzle requires an image
      alert("Please select an image for the puzzle");
      return;
    }

    // Upload new image if one is selected
    if (file) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        const response = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();

        formData.images = [
          {
            path: data.path,
            isCorrect: true,
            order: 0,
          },
        ];
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
        return;
      }
    }
  }

  try {
    if (contentId) {
      await updateContent(type, contentId, formData);
      alert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`
      );
    } else {
      await createContent(type, formData);
      alert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`
      );
    }

    // Reset the form and hide modal
    hideContentModal();
    await fetchContent().then(renderContent);
  } catch (error) {
    console.error("Error saving content:", error);
    alert("Failed to save content. Please try again.");
  }
}

async function handleDeleteContent(type, contentId) {
  if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

  try {
    await deleteContent(type, contentId);
    await fetchContent().then(renderContent);
    alert(
      `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`
    );
  } catch (error) {
    console.error("Error deleting content:", error);
    alert("Failed to delete content. Please try again.");
  }
}

function setupQuizForm() {
  const addChoiceBtn = document.getElementById("add-choice");
  const choicesContainer = document.getElementById("choices-container");
  const cancelBtn = document.querySelector("#quiz-form .cancel-btn");

  // Remove any existing event listeners
  addChoiceBtn.replaceWith(addChoiceBtn.cloneNode(true));

  // Get the fresh reference to the button
  const newAddChoiceBtn = document.getElementById("add-choice");

  // Add Location Tracking toggle
  const locationTracking = document.getElementById("quiz-location-tracking");
  const roomSelect = document.getElementById("quiz-room-select");
  locationTracking.addEventListener("change", () => {
    roomSelect.classList.toggle("hidden", !locationTracking.checked);
  });

  // Add GPS Tracking toggle
  const gpsTracking = document.getElementById("quiz-gps-tracking");
  const gpsLocationSelect = document.getElementById("quiz-gps-location");
  gpsTracking.addEventListener("change", () => {
    gpsLocationSelect.classList.toggle("hidden", !gpsTracking.checked);
  });

  // Add choice button handler
  newAddChoiceBtn.addEventListener("click", () => {
    const choiceItem = document.createElement("div");
    choiceItem.className = "choice-item";
    const radioValue = choicesContainer.children.length;

    choiceItem.innerHTML = `
      <input type="radio" name="correct-answer" value="${radioValue}" required>
      <input type="text" class="choice-input" placeholder="The main content of the Choice..." required>
      <button type="button" class="remove-choice">×</button>
    `;

    choicesContainer.appendChild(choiceItem);

    // Add remove button handler
    choiceItem.querySelector(".remove-choice").addEventListener("click", () => {
      choiceItem.remove();
      updateChoiceValues();
    });
  });

  // Cancel button handler
  cancelBtn.addEventListener("click", hideContentModal);
}

function updateChoiceValues() {
  const choices = document.querySelectorAll('.choice-item input[type="radio"]');
  choices.forEach((radio, index) => {
    radio.value = index;
  });
}

async function handleQuizSubmit(event) {
  event.preventDefault();

  const modal = document.getElementById("content-modal");
  const contentId = modal.dataset.contentId;

  const choices = Array.from(document.querySelectorAll(".choice-item")).map(
    (item, index) => ({
      text: item.querySelector(".choice-input").value,
      isCorrect: item.querySelector('input[type="radio"]').checked,
    })
  );

  const formData = {
    question: document.getElementById("quiz-question").value,
    choices: choices,
    pointsValue: parseInt(document.getElementById("quiz-points").value),
    locationTracking: document.getElementById("quiz-location-tracking").checked,
    gpsTracking: document.getElementById("quiz-gps-tracking").checked,
    type: "quiz",
    updatedAt: new Date().toISOString(),
  };

  if (formData.locationTracking) {
    formData.room = document.getElementById("quiz-room-select").value;
  }

  if (formData.gpsTracking) {
    formData.location = document.getElementById("quiz-gps-location").value;
  }

  try {
    if (contentId) {
      await updateContent("quiz", contentId, formData);
      alert("Quiz updated successfully!");
    } else {
      await createContent("quiz", formData);
      alert("Quiz created successfully!");
    }
    hideContentModal();
    await fetchContent().then(renderContent);
  } catch (error) {
    console.error("Error saving quiz:", error);
    alert("Failed to save quiz. Please try again.");
  }
}

function setupPuzzleForm() {
  // Location Tracking toggle
  const locationTracking = document.getElementById("location-tracking");
  const roomSelect = document.getElementById("room-select");
  locationTracking.addEventListener("change", () => {
    roomSelect.classList.toggle("hidden", !locationTracking.checked);
  });

  // GPS Tracking toggle
  const gpsTracking = document.getElementById("gps-tracking");
  const locationSelect = document.getElementById("location-select");
  gpsTracking.addEventListener("change", () => {
    locationSelect.classList.toggle("hidden", !gpsTracking.checked);
  });

  // Initialize existing image items
  document.querySelectorAll(".image-choice-item").forEach(initializeImageItem);

  // Hide the add image button
  const addImageBtn = document.getElementById("add-image");
  if (addImageBtn) {
    addImageBtn.style.display = "none";
  }
}

function createImageChoiceItem() {
  const choiceItem = document.createElement("div");
  choiceItem.className = "image-choice-item";
  const radioValue = document.querySelectorAll(".image-choice-item").length;

  choiceItem.innerHTML = `
    <input type="radio" name="correct-image" value="${radioValue}" required>
    <div class="image-upload-area">
      <div class="image-placeholder">
        <img src="#" alt="Image Will be Shown Here" class="preview-image hidden">
        <span class="placeholder-text">Image Will be Shown Here</span>
      </div>
      <div class="upload-info">
        <div class="supported-formats">Supported formats: JPEG, PNG, JPG</div>
        <label class="upload-btn">
          UPLOAD FILE
          <input type="file" class="file-input" accept=".jpg,.jpeg,.png" hidden>
        </label>
      </div>
      <button type="button" class="remove-image">×</button>
    </div>
  `;

  return choiceItem;
}

function initializeImageItem(imageItem) {
  const fileInput = imageItem.querySelector(".file-input");
  const previewImage = imageItem.querySelector(".preview-image");
  const placeholderText = imageItem.querySelector(".placeholder-text");
  const radioInput = imageItem.querySelector('input[type="radio"]');

  // Automatically check the radio button if it's the first/only image
  const allImageItems = document.querySelectorAll(".image-choice-item");
  if (allImageItems.length === 1) {
    radioInput.checked = true;
  }

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.classList.remove("hidden");
        placeholderText.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // Remove the remove button since we only want one image
  const removeButton = imageItem.querySelector(".remove-image");
  if (removeButton) {
    removeButton.style.display = "none";
  }
}

function updateImageValues() {
  const choices = document.querySelectorAll(
    '.image-choice-item input[type="radio"]'
  );
  choices.forEach((radio, index) => {
    radio.value = index;
  });
}

async function setupQuestForm() {
  // Setup object recognition dropdown
  const objectRecognition = document.getElementById("quest-object-recognition");
  const recognitionItem = document.getElementById("quest-recognition-item");

  // Fetch and populate objects dropdown only for new quests
  const objects = await fetchObjectsForRecognition();
  recognitionItem.innerHTML = `
    ${objects
      .map((obj) => `<option value="${obj.id}">${obj.name}</option>`)
      .join("")}
  `;

  setupQuestFormListeners();
}

// Separate function for event listeners
function setupQuestFormListeners() {
  const locationTracking = document.getElementById("quest-location-tracking");
  const roomSelect = document.getElementById("quest-room-select");
  const gpsTracking = document.getElementById("quest-gps-tracking");
  const locationSelect = document.getElementById("quest-location-select");
  const objectRecognition = document.getElementById("quest-object-recognition");
  const recognitionItem = document.getElementById("quest-recognition-item");
  const cancelBtn = document.querySelector("#quest-form .cancel-btn");

  // Location tracking toggle
  locationTracking.addEventListener("change", () => {
    roomSelect.classList.toggle("hidden", !locationTracking.checked);
  });

  // GPS tracking toggle
  gpsTracking.addEventListener("change", () => {
    locationSelect.classList.toggle("hidden", !gpsTracking.checked);
  });

  // Object recognition toggle
  objectRecognition.addEventListener("change", () => {
    recognitionItem.classList.toggle("hidden", !objectRecognition.checked);
  });

  // Cancel button handler
  cancelBtn.addEventListener("click", hideContentModal);
}

async function handleQuestSubmit(event) {
  event.preventDefault();

  const modal = document.getElementById("content-modal");
  const contentId = modal.dataset.contentId;
  const objectRecognition = document.getElementById("quest-object-recognition");
  const recognitionItem = document.getElementById("quest-recognition-item");

  const formData = {
    description: document.getElementById("quest-description").value,
    pointsValue: parseInt(document.getElementById("quest-points").value),
    objectRecognition: objectRecognition.checked,
    locationTracking: document.getElementById("quest-location-tracking")
      .checked,
    gpsTracking: document.getElementById("quest-gps-tracking").checked,
    type: "quest",
    updatedAt: new Date().toISOString(),
  };

  // Only add recognitionItem if objectRecognition is checked and an item is selected
  if (formData.objectRecognition && recognitionItem.value) {
    formData.recognitionItem = recognitionItem.value;
  } else if (formData.objectRecognition && !recognitionItem.value) {
    alert("Please select an object for recognition");
    return;
  }

  if (formData.locationTracking) {
    formData.room = document.getElementById("quest-room-select").value;
  }

  if (formData.gpsTracking) {
    formData.location = document.getElementById("quest-location-select").value;
  }

  try {
    if (contentId) {
      await updateContent("quest", contentId, formData);
      alert("Quest updated successfully!");
    } else {
      await createContent("quest", formData);
      alert("Quest created successfully!");
    }

    hideContentModal();
    await fetchContent().then(renderContent);
  } catch (error) {
    console.error("Error saving quest:", error);
    alert("Failed to save quest. Please try again.");
  }
}

/* ------------------------------- Initialization ------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  // Load initial content first
  try {
    const content = await fetchContent();
    renderContent(content);
  } catch (err) {
    console.error("Error loading content:", err);
  }

  // Add content buttons
  document
    .getElementById("add-quest")
    .addEventListener("click", () => showContentModal("quest"));
  document
    .getElementById("add-puzzle")
    .addEventListener("click", () => showContentModal("puzzle"));
  document
    .getElementById("add-quiz")
    .addEventListener("click", () => showContentModal("quiz"));

  // Modal close button
  document
    .getElementById("close-content-modal")
    .addEventListener("click", hideContentModal);
  document
    .getElementById("close-details-modal")
    .addEventListener("click", () => {
      document.getElementById("content-details-modal").classList.add("hidden");
    });

  // Form submission
  document
    .getElementById("puzzle-form")
    .addEventListener("submit", handleContentSubmit);
  document
    .getElementById("quest-form")
    .addEventListener("submit", handleQuestSubmit);
  document
    .getElementById("quiz-form")
    .addEventListener("submit", handleQuizSubmit);
});

// Add this function to show content details
async function showContentDetails(type, contentId) {
  // Find the content item
  const content = currentContent[type].find((item) => item.id === contentId);
  if (!content) return;

  const modal = document.getElementById("content-details-modal");
  const container = document.getElementById("content-details-container");

  let detailsHTML = `
    <div class="content-details">
      <p class="content-type"><strong>Type:</strong> ${type.toUpperCase()}</p>
      <p class="content-id"><strong>ID:</strong> ${content.id}</p>
  `;

  if (type === "puzzle") {
    detailsHTML += `
      <div class="description-section">
        <p><strong>Description:</strong> ${
          content.description || "No description"
        }</p>
      </div>
      <div class="images-section">
        <p><strong>Images:</strong></p>
        <div class="details-image-grid">
          ${
            content.images
              ? content.images
                  .map(
                    (image, index) => `
            <div class="details-image-item ${
              image.isCorrect ? "correct-answer" : ""
            }">
              <img src="http://localhost:3000${image.path}" alt="Puzzle Image ${
                      index + 1
                    }">
              ${image.isCorrect ? '<span class="correct-badge">✓</span>' : ""}
            </div>
          `
                  )
                  .join("")
              : "<p>No images uploaded</p>"
          }
        </div>
      </div>
    `;
  } else if (type === "quiz") {
    detailsHTML += `
      <div class="question-section">
        <p><strong>Question:</strong> ${content.question || "No question"}</p>
      </div>
      <div class="choices-section">
        <p><strong>Choices:</strong></p>
        <ul>
          ${
            content.choices
              ?.map(
                (choice) =>
                  `<li class="${choice.isCorrect ? "correct-answer" : ""}">${
                    choice.text
                  } 
             ${choice.isCorrect ? " (Correct Answer)" : ""}</li>`
              )
              .join("") || "No choices"
          }
        </ul>
      </div>
    `;
  } else if (type === "quest") {
    detailsHTML += `
      <div class="description-section">
        <p><strong>Description:</strong> ${
          content.description || "No description"
        }</p>
      </div>
      ${
        content.objectRecognition
          ? `
        <div class="recognition-section">
          <p><strong>Object Recognition Item:</strong> ${
            content.recognitionItem || "None"
          }</p>
        </div>
      `
          : ""
      }
    `;
  }

  // Common details for all types
  detailsHTML += `
    <div class="tracking-section">
      <p><strong>Points Value:</strong> ${content.pointsValue || 0}</p>
      <p><strong>Location Tracking:</strong> ${
        content.locationTracking ? "Enabled" : "Disabled"
      }
         ${
           content.locationTracking
             ? `<br>Room: ${content.room || "Not specified"}`
             : ""
         }</p>
      <p><strong>GPS Tracking:</strong> ${
        content.gpsTracking ? "Enabled" : "Disabled"
      }
         ${
           content.gpsTracking
             ? `<br>Location: ${content.location || "Not specified"}`
             : ""
         }</p>
    </div>
    <div class="timestamp-section">
      <p><strong>Last Updated:</strong> ${new Date(
        content.updatedAt
      ).toLocaleString()}</p>
    </div>
  </div>`;

  container.innerHTML = detailsHTML;
  modal.classList.remove("hidden");
}

// Make sure this event listener is added to close the details modal
document.getElementById("close-details-modal").addEventListener("click", () => {
  document.getElementById("content-details-modal").classList.add("hidden");
});

// Add this function to fetch objects from Firebase
async function fetchObjectsForRecognition() {
  try {
    const objectsCollection = collection(db, "objects");
    const snapshot = await getDocs(objectsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
  } catch (error) {
    console.error("Error fetching objects:", error);
    return [];
  }
}
