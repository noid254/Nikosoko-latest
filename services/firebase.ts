import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

// Helper – never let Firebase block the UI for too long
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs))
  ]);
}

/**
 * Upload image to Firebase Storage.
 * Never returns a data: URL (this is what was causing pictures to disappear).
 */
export async function uploadImageToStorage(
  fileOrDataUrl: File | Blob | string,
  storagePath: string
): Promise<string> {
  try {
    if (
      typeof fileOrDataUrl === 'string' &&
      (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))
    ) {
      return fileOrDataUrl;
    }

    const storageRef = ref(storage, storagePath);
    let blobToUpload: Blob;

    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      const res = await fetch(fileOrDataUrl);
      blobToUpload = await res.blob();
    } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      blobToUpload = fileOrDataUrl;
    } else if (typeof fileOrDataUrl === 'string') {
      return fileOrDataUrl;
    } else {
      throw new Error('Unsupported image input type');
    }

    // Give the real upload up to 12 seconds (reasonable for mobile)
    const snapshot = await withTimeout(
      uploadBytes(storageRef, blobToUpload),
      12000,
      null as any
    );

    if (!snapshot) {
      throw new Error('Upload timed out. Please try a smaller photo.');
    }

    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw new Error(
      'Failed to upload image. Please try a smaller photo or check your connection.'
    );
  }
}

export async function saveUserProfileToFirestore(
  userId: string,
  profileData: Partial<ServiceProvider>
): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);

    const cleanData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    Object.entries(profileData).forEach(([key, val]) => {
      if (val === undefined) return;
      // Never store data URLs
      if (
        typeof val === 'string' &&
        val.startsWith('data:') &&
        (key === 'avatarUrl' || key === 'coverImageUrl' || key === 'catalogueBannerUrl')
      ) {
        return;
      }
      cleanData[key] = val;
    });

    // Soft timeout so the UI never freezes
    await withTimeout(setDoc(userRef, cleanData, { merge: true }), 3000, undefined);

    if (profileData.phone) {
      const cleanPhone = profileData.phone.replace(/\D/g, '');
      if (cleanPhone) {
        const phoneRef = doc(db, 'user_phones', cleanPhone);
        await withTimeout(
          setDoc(phoneRef, { userId, updatedAt: new Date().toISOString() }, { merge: true }),
          2000,
          undefined
        );
      }
    }
  } catch (error) {
    console.error(`Error saving user profile to Firestore:`, error);
  }
}

export async function getUserProfileFromFirestore(
  userId: string
): Promise<ServiceProvider | null> {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    return await withTimeout(
      getDoc(userRef).then((snap) => (snap.exists() ? (snap.data() as ServiceProvider) : null)),
      2000,
      null
    );
  } catch (error) {
    console.error(`Error fetching user profile:`, error);
    return null;
  }
}

export async function getAllUserProfilesFromFirestore(): Promise<ServiceProvider[]> {
  try {
    return await withTimeout(
      getDocs(collection(db, 'users')).then((qs) => {
        const profiles: ServiceProvider[] = [];
        qs.forEach((d) => {
          if (d.exists()) profiles.push(d.data() as ServiceProvider);
        });
        return profiles;
      }),
      2500,
      []
    );
  } catch (error) {
    console.error('Error fetching all user profiles:', error);
    return [];
  }
}