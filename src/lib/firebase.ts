import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { Product, Order, User, RawMaterial, OrderStatus } from '../types';

interface FirebaseAppletConfig {
  projectId?: string;
  appId?: string;
  apiKey?: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

// Dynamically load gitignored local config if present (works cleanly on fresh GitHub clones without the file)
const localConfigModules = import.meta.glob<{ default: FirebaseAppletConfig }>(
  '../../firebase-applet-config.json',
  { eager: true }
);
const localConfig: FirebaseAppletConfig =
  Object.values(localConfigModules)[0]?.default ?? {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket || '',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId || '',
};

const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId || '(default)';

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// 1. Initialize Firebase App and Services when configured
let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app, firestoreDatabaseId);
  authInstance = getAuth(app);
}

export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged };

// 2. Validate connection on boot
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network status.');
    }
  }
}
testConnection();

// 3. Standardized Error Handling Helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to strip undefined fields recursively before writing to Firestore
function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 4. Role & Initial Admin Bootstrap Verification (No hardcoded emails)
export async function checkIsAdminInFirestore(uid: string): Promise<boolean> {
  if (!db || !auth?.currentUser) return false;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export async function isAdminBootstrapNeeded(): Promise<boolean> {
  if (!db || !auth?.currentUser || !auth.currentUser.emailVerified) return false;
  try {
    const bootstrapSnap = await getDoc(doc(db, 'appConfig', 'bootstrap'));
    return !bootstrapSnap.exists();
  } catch {
    return false;
  }
}

export async function claimInitialAdmin(): Promise<boolean> {
  if (!db || !auth?.currentUser) return false;
  const fbUser = auth.currentUser;
  if (!fbUser.emailVerified || !fbUser.email) {
    throw new Error('Verified email required to configure administrator access.');
  }

  const path = `admins/${fbUser.uid}`;
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'appConfig', 'bootstrap'), {
      initialized: true,
      initializedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'admins', fbUser.uid), {
      uid: fbUser.uid,
      email: fbUser.email,
      createdAt: new Date().toISOString(),
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function buildAppUserFromFirebase(fbUser: FirebaseUser): Promise<User> {
  const isAdmin = await checkIsAdminInFirestore(fbUser.uid);
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cliente Postresito',
    email: fbUser.email || '',
    phone: fbUser.phoneNumber || '',
    role: isAdmin ? 'admin' : 'customer',
    createdAt: new Date().toISOString(),
  };
}

// 5. Products API with Persistence
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  if (!db) return [];
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    const items: Product[] = [];
    snap.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as Product);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  if (!db) return;
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), stripUndefined(product));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProductStockInFirestore(
  productId: string,
  stock: number,
  totalSold: number,
  isAvailable: boolean
): Promise<void> {
  if (!db) return;
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), {
      stock,
      totalSold,
      isAvailable,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  if (!db) return;
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedProductsIfEmpty(initialList: Product[]): Promise<Product[]> {
  if (!db) return initialList;
  try {
    const existing = await fetchProductsFromFirestore();
    if (existing.length > 0) {
      return existing;
    }
    // Only attempt to seed catalog if an authenticated admin is signed in
    if (auth?.currentUser && (await checkIsAdminInFirestore(auth.currentUser.uid))) {
      for (const prod of initialList) {
        await setDoc(doc(db, 'products', prod.id), stripUndefined(prod));
      }
    }
    return initialList;
  } catch (e) {
    console.warn('Could not load firestore products, falling back to local list:', e);
    return initialList;
  }
}

// 6. Orders API with Persistence
export async function saveOrderToFirestore(order: Order): Promise<void> {
  if (!db) return;
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), stripUndefined(order));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  if (!db) return;
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  userId?: string,
  isAdminUser?: boolean
) {
  if (!db || !auth?.currentUser || (!isAdminUser && !userId)) {
    return () => {};
  }

  const path = 'orders';
  const q = isAdminUser
    ? query(collection(db, path))
    : query(collection(db, path), where('customer.userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Order);
      });
      list.sort((a, b) => b.id.localeCompare(a.id));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 7. Raw Materials API with Persistence
export async function fetchRawMaterialsFromFirestore(): Promise<RawMaterial[]> {
  if (!db || !auth?.currentUser) return [];
  const path = 'rawMaterials';
  try {
    const snap = await getDocs(collection(db, path));
    const items: RawMaterial[] = [];
    snap.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as RawMaterial);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveRawMaterialToFirestore(material: RawMaterial): Promise<void> {
  if (!db) return;
  const path = `rawMaterials/${material.id}`;
  try {
    await setDoc(doc(db, 'rawMaterials', material.id), stripUndefined(material));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRawMaterialFromFirestore(id: string): Promise<void> {
  if (!db) return;
  const path = `rawMaterials/${id}`;
  try {
    await deleteDoc(doc(db, 'rawMaterials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 8. User Profile Persistence (Least privilege: never self-assigns admin role)
export async function syncUserProfile(user: User): Promise<void> {
  if (!db || !auth?.currentUser) return;
  const path = `users/${user.id}`;
  try {
    const userRef = doc(db, 'users', user.id);
    const existingSnap = await getDoc(userRef);
    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        id: user.id,
        name: user.name.slice(0, 120),
        email: user.email.slice(0, 120),
        phone: (user.phone || '').slice(0, 30),
        role: 'customer',
        createdAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userRef, {
        name: user.name.slice(0, 120),
        phone: (user.phone || '').slice(0, 30),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 9. Auth Helpers
export async function loginWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured in this environment.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  const appUser = await buildAppUserFromFirebase(result.user);
  await syncUserProfile(appUser);
  return appUser;
}

export async function logoutFromFirebase(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}
