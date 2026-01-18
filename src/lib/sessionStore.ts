// Simple IndexedDB wrapper for session data
// Persists the video blob and metadata across page refreshes

type SessionData = {
    videoBlob: Blob;
    videoUrl?: string; // We'll regenerate this on load
    duration: number;
    timestamp: number;
    analysis?: any; // Store Gemini analysis results (summary + events)
    scenario?: string; // The practice context (sales, pitch, speaking)
};

const DB_NAME = "ReflektorSessions";
const STORE_NAME = "sessions";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

export const sessionStore = {
    async setSession(data: { videoBlob: Blob; duration: number; timestamp: number; analysis?: any; scenario?: string }) {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        // We only care about the most recent session for now
        // Storing with a fixed key 'current'
        store.put({
            videoBlob: data.videoBlob,
            duration: data.duration,
            timestamp: data.timestamp,
            analysis: (data as any).analysis || [],
            scenario: data.scenario
        }, 'current');

        return new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getSession(): Promise<SessionData | null> {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get('current');

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    // Regenerate the Blob URL as it's not persistent
                    data.videoUrl = URL.createObjectURL(data.videoBlob);
                    resolve(data);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    },

    async clearSession() {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete('current');

        return new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
};

