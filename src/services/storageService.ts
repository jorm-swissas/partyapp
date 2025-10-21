// Firebase Storage Service for Event Images
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload an image to Firebase Storage
 * @param uri - Local URI of the image
 * @param path - Storage path (e.g., 'events/event123.jpg')
 * @returns Download URL of the uploaded image
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    // Fetch the image from local URI
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload the image
    await uploadBytes(storageRef, blob);

    // Get and return the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload event image
 * @param imageUri - Local URI of the event image
 * @param eventId - ID of the event
 * @returns Download URL of the uploaded image
 */
export const uploadEventImage = async (
  imageUri: string,
  eventId: string
): Promise<string> => {
  const timestamp = Date.now();
  const path = `events/${eventId}_${timestamp}.jpg`;
  return uploadImage(imageUri, path);
};

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - Download URL of the image to delete
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL');
    }

    const pathPart = urlParts[1].split('?')[0];
    const path = decodeURIComponent(pathPart);

    // Create storage reference and delete
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw new Error(error.message || 'Failed to delete image');
  }
};

/**
 * Delete event image
 * @param imageUrl - Download URL of the event image
 */
export const deleteEventImage = async (imageUrl: string): Promise<void> => {
  return deleteImage(imageUrl);
};
