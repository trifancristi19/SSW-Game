import { db } from "./firebase.js";
import { 
  collection, 
  addDoc,
  getDocs 
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Function to initialize file upload functionality for an object item
function initializeObjectItem(objectItem) {
  // Initialize the first upload area
  initializeUploadArea(objectItem.querySelector('.upload-area'));
  
  // Add handler for adding new image upload areas
  const addImageBtn = objectItem.querySelector('.add-image-btn');
  addImageBtn.addEventListener('click', () => {
    const uploadAreas = objectItem.querySelector('.upload-areas');
    const newUploadArea = createUploadArea();
    uploadAreas.insertBefore(newUploadArea, addImageBtn);
    initializeUploadArea(newUploadArea);
  });

  // Add remove button handler
  objectItem.querySelector('.remove-object').addEventListener('click', () => {
    objectItem.remove();
  });
}

// New function to create upload area
function createUploadArea() {
  const uploadArea = document.createElement('div');
  uploadArea.className = 'upload-area';
  uploadArea.innerHTML = `
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
  `;
  return uploadArea;
}

// New function to initialize a single upload area
function initializeUploadArea(uploadArea) {
  const fileInput = uploadArea.querySelector('.file-input');
  const previewImage = uploadArea.querySelector('.preview-image');
  const placeholderText = uploadArea.querySelector('.placeholder-text');
  const removeImageBtn = uploadArea.querySelector('.remove-image');

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      uploadArea.remove();
    });
  }

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        placeholderText.textContent = 'Uploading...';
        
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        const imageUrl = `http://localhost:3000${data.path}`;
        
        previewImage.onload = () => {
          previewImage.classList.remove('hidden');
          placeholderText.classList.add('hidden');
        };
        
        previewImage.src = imageUrl;
        uploadArea.dataset.imagePath = data.path;

      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
        placeholderText.textContent = 'Image Will be Shown Here';
      }
    }
  });
}

function createObjectItem() {
  const objectItem = document.createElement('div');
  objectItem.className = 'object-item';
  
  objectItem.innerHTML = `
    <input type="text" placeholder="Name of the Object for Recognition" class="object-name">
    <div class="upload-areas">
      <div class="upload-area">
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
      </div>
      <button type="button" class="add-image-btn">+ Add Another Angle</button>
    </div>
    <button type="button" class="remove-object">×</button>
  `;

  initializeObjectItem(objectItem);
  return objectItem;
}

async function handleConfirm() {
  const objectItems = document.querySelectorAll('.object-item');
  const objects = [];

  for (const item of objectItems) {
    const name = item.querySelector('.object-name').value;
    const uploadAreas = item.querySelectorAll('.upload-area');
    const imagePaths = [];

    for (const uploadArea of uploadAreas) {
      const imagePath = uploadArea.dataset.imagePath;
      if (!imagePath) {
        alert('Please upload images for all areas');
        return;
      }
      imagePaths.push(imagePath);
    }

    if (!name || imagePaths.length === 0) {
      alert('Please fill in all fields and upload at least one image for each object');
      return;
    }

    objects.push({
      name,
      imagePaths,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const objectsCollection = collection(db, 'objects');
    for (const object of objects) {
      await addDoc(objectsCollection, object);
    }
    alert('Objects saved successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error saving objects:', error);
    alert('Failed to save objects. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the first object item that exists in HTML
  const firstObjectItem = document.querySelector('.object-item');
  if (firstObjectItem) {
    initializeObjectItem(firstObjectItem);
  }

  // Confirm button
  const confirmBtn = document.querySelector('.confirm-btn');
  confirmBtn.addEventListener('click', handleConfirm);

  // Cancel button
  const cancelBtn = document.querySelector('.cancel-btn');
  cancelBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}); 