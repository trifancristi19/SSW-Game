import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import * as ImagePicker from "expo-image-picker";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";
import * as mobilenet from "@tensorflow-models/mobilenet";

const BASE_URL = "http://172.20.10.5:3000";
const SIMILARITY_THRESHOLD = 0.9; // Keep high threshold
const FEATURE_SIMILARITY_THRESHOLD = 0.85;
const COLOR_SIMILARITY_THRESHOLD = 0.8;

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export default function QuestScreen({ route, navigation }) {
  const { questId } = route.params;
  const [loading, setLoading] = useState(true);
  const [questData, setQuestData] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    fetchQuestData();
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      await tf.ready(); // Initialize TensorFlow.js
    })();
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await mobilenet.load({
          version: 2,
          alpha: 1.0,
        });
        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading MobileNet model:", error);
      }
    };
    loadModel();
  }, []);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      const questRef = doc(db, "quest", questId);
      const questSnapshot = await getDoc(questRef);

      if (!questSnapshot.exists()) {
        Alert.alert("Error", "Quest not found");
        navigation.goBack();
        return;
      }

      const questData = questSnapshot.data();
      console.log("Quest data:", JSON.stringify(questData, null, 2));

      // Get the object ID from quest data using recognitionItem field
      const objectId = questData.recognitionItem; // Changed from objectId to recognitionItem
      if (!objectId) {
        console.error("No recognition item found in quest data");
        Alert.alert("Error", "Quest configuration is incomplete");
        navigation.goBack();
        return;
      }

      // Fetch the object data
      const objectRef = doc(db, "objects", objectId);
      const objectSnapshot = await getDoc(objectRef);

      if (!objectSnapshot.exists()) {
        console.error("Object not found");
        Alert.alert("Error", "Referenced object not found");
        navigation.goBack();
        return;
      }

      const objectData = objectSnapshot.data();
      console.log("Object data:", JSON.stringify(objectData, null, 2));

      // Get all image paths from object data
      let imagePaths = [];
      if (objectData.imagePaths && objectData.imagePaths.length > 0) {
        imagePaths = objectData.imagePaths.map((path) => {
          if (!path.startsWith("/")) {
            return "/" + path;
          }
          return path;
        });
        console.log("Using imagePaths:", imagePaths);
      }

      if (imagePaths.length > 0) {
        const urls = imagePaths.map((path) => `${BASE_URL}${path}`);
        console.log("Reference image URLs:", urls);
        setReferenceImageUrl(urls); // Store all URLs
        setQuestData({
          ...questData,
          objectData: objectData,
        });
      } else {
        console.error("No valid image paths found in object data:", objectData);
        Alert.alert(
          "Error",
          "Reference images not found. Please check object configuration."
        );
        navigation.goBack();
        return;
      }
    } catch (error) {
      console.error("Error fetching quest:", error);
      Alert.alert("Error", "Failed to load quest");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const calculateColorHistogram = async (tensor) => {
    return tf.tidy(() => {
      // Convert to RGB channels
      const channels = tf.split(tensor, 3, -1);
      const histograms = channels.map((channel) => {
        // Create bins manually since tf.histogram isn't available
        const binCount = 32;
        const values = channel.reshape([-1]);
        const bins = tf.linspace(0, 1, binCount);

        // Calculate histogram manually
        const histogram = tf.buffer([binCount]);

        // Use gather and sum to count values in each bin
        for (let i = 0; i < binCount - 1; i++) {
          const binStart = bins.arraySync()[i];
          const binEnd = bins.arraySync()[i + 1];

          const mask = tf.logicalAnd(
            tf.greaterEqual(values, binStart),
            tf.less(values, binEnd)
          );
          const count = tf.sum(tf.cast(mask, "float32")).arraySync();
          histogram.set(count, i);
        }

        // Handle the last bin edge case
        const lastBinMask = tf.greaterEqual(
          values,
          bins.arraySync()[binCount - 1]
        );
        const lastCount = tf.sum(tf.cast(lastBinMask, "float32")).arraySync();
        histogram.set(lastCount, binCount - 1);

        // Convert to tensor and normalize
        const histTensor = histogram.toTensor();
        return tf.div(histTensor, tf.sum(histTensor));
      });

      return tf.stack(histograms);
    });
  };

  const calculateHistogramSimilarity = async (hist1, hist2) => {
    return tf.tidy(() => {
      // Calculate intersection of histograms
      const minima = tf.minimum(hist1, hist2);
      const similarity = tf.sum(minima).dataSync()[0];

      // Handle NaN values
      return isNaN(similarity) ? 0 : similarity;
    });
  };

  const extractFeatures = async (imageTensor) => {
    if (!model) return null;

    // Get features from the second-to-last layer
    const features = await model.infer(imageTensor, {
      embedding: true,
    });
    return features;
  };

  const calculateStructuralSimilarity = (tensor1, tensor2) => {
    return tf.tidy(() => {
      // Constants for SSIM calculation
      const C1 = 0.01 * 255 * 0.01 * 255;
      const C2 = 0.03 * 255 * 0.03 * 255;

      // Calculate means
      const mu1 = tf.mean(tensor1);
      const mu2 = tf.mean(tensor2);

      // Calculate variances and covariance
      const sigma1Sq = tf.mean(tf.square(tf.sub(tensor1, mu1)));
      const sigma2Sq = tf.mean(tf.square(tf.sub(tensor2, mu2)));
      const sigma12 = tf.mean(
        tf.mul(tf.sub(tensor1, mu1), tf.sub(tensor2, mu2))
      );

      // Calculate SSIM
      const numerator = tf.mul(
        tf.add(tf.mul(tf.mul(mu1, mu2), 2), C1),
        tf.add(tf.mul(sigma12, 2), C2)
      );
      const denominator = tf.mul(
        tf.add(tf.add(tf.square(mu1), tf.square(mu2)), C1),
        tf.add(tf.add(sigma1Sq, sigma2Sq), C2)
      );

      return tf.div(numerator, denominator).dataSync()[0];
    });
  };

  const calculateImageSimilarity = async (image1Uri, image2Uri) => {
    try {
      const [img1Data, img2Data] = await Promise.all([
        FileSystem.readAsStringAsync(image1Uri, {
          encoding: FileSystem.EncodingType.Base64,
        }),
        FileSystem.readAsStringAsync(image2Uri, {
          encoding: FileSystem.EncodingType.Base64,
        }),
      ]);

      // Convert images to tensors
      const tensor1 = await tf.tidy(() => {
        const imgBuffer1 = tf.util.encodeString(img1Data, "base64").buffer;
        const raw1 = new Uint8Array(imgBuffer1);
        return tf.cast(decodeJpeg(raw1), "float32").div(255);
      });

      const tensor2 = await tf.tidy(() => {
        const imgBuffer2 = tf.util.encodeString(img2Data, "base64").buffer;
        const raw2 = new Uint8Array(imgBuffer2);
        return tf.cast(decodeJpeg(raw2), "float32").div(255);
      });

      // Resize images to same dimensions
      const size = [224, 224];
      const resized1 = await tf.image.resizeBilinear(tensor1, size);
      const resized2 = await tf.image.resizeBilinear(tensor2, size);

      // Calculate multiple similarity metrics with error handling
      let colorSimilarity = 0;
      let structuralSimilarity = 0;
      let featureSimilarity = 0;

      try {
        const [hist1, hist2] = await Promise.all([
          calculateColorHistogram(resized1),
          calculateColorHistogram(resized2),
        ]);
        colorSimilarity = await calculateHistogramSimilarity(hist1, hist2);
      } catch (error) {
        console.warn("Error calculating color similarity:", error);
      }

      try {
        structuralSimilarity = calculateStructuralSimilarity(
          resized1,
          resized2
        );
      } catch (error) {
        console.warn("Error calculating structural similarity:", error);
      }

      try {
        if (model) {
          const [features1, features2] = await Promise.all([
            extractFeatures(resized1),
            extractFeatures(resized2),
          ]);

          if (features1 && features2) {
            featureSimilarity = tf.tidy(() => {
              const cosSimilarity = tf.losses.cosineDistance(
                features1,
                features2,
                0
              );
              return 1 - cosSimilarity.dataSync()[0];
            });
          }
        }
      } catch (error) {
        console.warn("Error calculating feature similarity:", error);
      }

      // Cleanup
      tf.dispose([tensor1, tensor2, resized1, resized2]);

      // Weighted combination of similarities with validation
      const validScores = [];
      const weights = [];

      if (!isNaN(featureSimilarity)) {
        validScores.push(featureSimilarity);
        weights.push(0.5);
      }
      if (!isNaN(colorSimilarity)) {
        validScores.push(colorSimilarity);
        weights.push(0.3);
      }
      if (!isNaN(structuralSimilarity)) {
        validScores.push(structuralSimilarity);
        weights.push(0.2);
      }

      // Calculate weighted average of valid scores
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const combinedSimilarity = validScores.reduce((sum, score, i) => {
        return sum + (score * weights[i]) / totalWeight;
      }, 0);

      console.log("Similarity Scores:", {
        feature: featureSimilarity,
        color: colorSimilarity,
        structural: structuralSimilarity,
        combined: combinedSimilarity,
      });

      return combinedSimilarity;
    } catch (error) {
      console.error("Error calculating image similarity:", error);
      throw error;
    }
  };

  const takePicture = async () => {
    try {
      console.log("Starting picture capture...");
      const result = await ImagePicker.launchCameraAsync({
        mediaType: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled) {
        setLoading(true);
        console.log("Picture captured, processing...");

        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 640 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setCapturedImage(manipulatedImage.uri);

        try {
          // Process all reference images
          const similarityScores = await Promise.all(
            referenceImageUrl.map(async (url) => {
              // Download and cache reference image
              const referenceResponse = await fetchWithTimeout(url);
              if (!referenceResponse.ok) {
                throw new Error(
                  `HTTP error! status: ${referenceResponse.status}`
                );
              }

              const referenceBlob = await referenceResponse.blob();
              const base64Reference = await blobToBase64(referenceBlob);

              const localReferenceUri = `${
                FileSystem.cacheDirectory
              }reference_${Date.now()}.jpg`;
              await FileSystem.writeAsStringAsync(
                localReferenceUri,
                base64Reference,
                { encoding: FileSystem.EncodingType.Base64 }
              );

              // Calculate similarity for this reference image
              return calculateImageSimilarity(
                manipulatedImage.uri,
                localReferenceUri
              );
            })
          );

          // Get the highest similarity score
          const maxSimilarity = Math.max(...similarityScores);
          console.log("Highest similarity score:", maxSimilarity);

          if (maxSimilarity >= SIMILARITY_THRESHOLD) {
            Alert.alert(
              "Success!",
              "Your picture matches one of the reference images! Well done!",
              [
                {
                  text: "OK",
                  onPress: () => {
                    if (route.params?.onComplete) {
                      route.params.onComplete(questData.pointsValue || 0);
                    }
                    navigation.goBack();
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              "Not Quite Right",
              "Your picture doesn't match closely enough with any of the reference images. Try again!",
              [
                {
                  text: "OK",
                  onPress: () => {
                    setCapturedImage(null);
                  },
                },
              ]
            );
          }
        } catch (error) {
          console.error("Error processing reference image:", error);

          // More specific error message based on error type
          let errorMessage = "Failed to process reference image.";
          if (error.name === "AbortError") {
            errorMessage =
              "Network request timed out. Please check your connection and try again.";
          } else if (error.message.includes("HTTP error")) {
            errorMessage =
              "Failed to download reference image. Please try again.";
          }

          Alert.alert("Error", errorMessage);
        }
      }
    } catch (error) {
      console.error("Error taking/processing picture:", error);
      Alert.alert("Error", "Failed to process picture");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert blob to base64
  const blobToBase64 = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      };
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });
  };

  if (loading || !questData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Only render the main content if questData exists
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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

      {/* Quest Content */}
      <View style={styles.content}>
        <Text style={styles.titleText}>Quest Challenge</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {questData?.description || "No description available"}
          </Text>
        </View>

        <View style={styles.cameraPreview}>
          {capturedImage ? (
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
            />
          ) : (
            <Text style={styles.previewText}>No image captured</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={takePicture}
          disabled={loading}
        >
          <Text style={styles.cameraButtonText}>
            {loading ? "Processing..." : "Take Picture"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.modelLoadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.modelLoadingText}>Processing image...</Text>
          </View>
        )}

        {questData?.pointsValue && (
          <View style={styles.pointsContainer}>
            <Image
              source={require("../assets/crown.png")}
              style={styles.pointsIcon}
            />
            <Text style={styles.pointsText}>
              Points: {questData.pointsValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF8CB2",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  gearIconContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  gearIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
  },
  descriptionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    padding: 25,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  descriptionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  cameraPreview: {
    width: "100%",
    height: 300,
    backgroundColor: "#FFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewText: {
    fontSize: 16,
    color: "#666",
  },
  cameraButton: {
    backgroundColor: "#000000",
    padding: 20,
    borderRadius: 40,
    marginVertical: 10,
  },
  cameraButtonText: {
    fontSize: 18,
    color: "#FF8CB2",
    textAlign: "center",
    fontWeight: "500",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 18,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  pointsIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 10,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modelLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  modelLoadingText: {
    color: "#FFFFFF",
    marginLeft: 10,
    fontSize: 14,
  },
});
