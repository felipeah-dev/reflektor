// Simple singleton store for session data
// In a real app this would be a Context or a persistence layer (IndexedDB)
// Using a global variable that persists as long as the page doesn't refresh

type SessionData = {
    videoBlob: Blob | null;
    videoUrl: string | null;
    duration: number;
    timestamp: number;
};

let currentSession: SessionData | null = null;

export const sessionStore = {
    setSession: (data: SessionData) => {
        currentSession = data;
    },
    getSession: () => currentSession,
    clearSession: () => {
        currentSession = null;
    }
};
