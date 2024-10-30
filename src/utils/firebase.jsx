import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Ensure your environment variables are set in your .env file and are loaded correctly.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_API_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MESSURE_ID

};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

export async function uploadFileToFirebase(file) {
  try {
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `chat_files/${uniqueFileName}`);

    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw error;
  }
}
