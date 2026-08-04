import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import type { ServiceProvider } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore DB
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth & Storage
export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * Upload an image (File, Blob, or Data URL base64 string) to Firebase Storage
 * and return the permanent public download URL.
 */
export async function uploadImageToStorage(
  fileOrDataUrl: File | Blob | string,
  storagePath: string
): Promise<string> {
  try {
    // If it's already an HTTP/HTTPS remote URL, no need to upload again
    if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
      return fileOrDataUrl;
    }

    const storageRef = ref(storage, storagePath);

    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      // Upload base64 data URL
      const snapshot = await uploadString(storageRef, fileOrDataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      // Upload File or Blob
      const snapshot = await uploadBytes(storageRef, fileOrDataUrl);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    }

    // Fallback if type is unrecognized string
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    throw new Error('Unsupported image input type for upload');
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    // Return original string if string input as fallback so UI does not break
    if (typeof fileOrDataUrl === 'string') {
      return fileOrDataUrl;
    }
    throw error;
  }
}

/**
 * Save or update user profile data directly inside Cloud Firestore under `users/{userId}`.
 */
export async function saveUserProfileToFirestore(
  userId: string,
  profileData: Partial<ServiceProvider>
): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    
    // Clean document data to prevent undefined values
    const cleanData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    Object.entries(profileData).forEach(([key, val]) => {
      if (val !== undefined) {
        cleanData[key] = val;
      }
    });

    await setDoc(userRef, cleanData, { merge: true });

    // Also index by phone if phone is present for easy lookup
    if (profileData.phone) {
      const cleanPhone = profileData.phone.replace(/\D/g, '');
      if (cleanPhone) {
        const phoneRef = doc(db, 'user_phones', cleanPhone);
        await setDoc(phoneRef, { userId, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }
  } catch (error) {
    console.error(`Error saving user profile to Firestore (users/${userId}):`, error);
  }
}

// Helper to execute Firestore operations with a fast timeout so app load is never blocked
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 1200, fallbackValue: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs))
  ]);
}

/**
 * Retrieve user profile document directly from Cloud Firestore under `users/{userId}`.
 */
export async function getUserProfileFromFirestore(
  userId: string
): Promise<ServiceProvider | null> {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const fetchPromise = getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as ServiceProvider;
      }
      return null;
    });
    return await withTimeout(fetchPromise, 1200, null);
  } catch (error) {
    console.error(`Error fetching user profile from Firestore (users/${userId}):`, error);
    return null;
  }
}

/**
 * Retrieve all user profile documents from Cloud Firestore.
 */
export async function getAllUserProfilesFromFirestore(): Promise<ServiceProvider[]> {
  try {
    const fetchPromise = getDocs(collection(db, 'users')).then((querySnapshot) => {
      const profiles: ServiceProvider[] = [];
      querySnapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          profiles.push(docSnap.data() as ServiceProvider);
        }
      });
      return profiles;
    });
    return await withTimeout(fetchPromise, 1200, []);
  } catch (error) {
    console.error('Error fetching all user profiles from Firestore:', error);
    return [];
  }
}
