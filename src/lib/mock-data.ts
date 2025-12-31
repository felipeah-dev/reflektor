export interface AnalysisResult {
    id: string;
    userId: string;
    date: string;
    duration: string;
    score: number;
    metrics: {
        pace: number; // words per minute
        sentiment: 'Positive' | 'Neutral' | 'Negative';
        eyeContact: number; // percentage
        clarity: number; // percentage
    };
    feedback: {
        timestamp: string;
        title: string;
        description: string;
        type: 'positive' | 'negative' | 'neutral';
        icon: string;
    }[];
    summary: string;
}

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
    id: "1",
    userId: "user_123",
    date: "24 Oct, 2026",
    duration: "2m 23s",
    score: 8.5,
    metrics: {
        pace: 130,
        sentiment: "Positive",
        eyeContact: 68,
        clarity: 94,
    },
    feedback: [
        {
            timestamp: "0:05",
            title: "Good Eye Contact",
            description: "Started with confident gaze.",
            type: "positive",
            icon: "check_circle",
        },
        {
            timestamp: "0:45",
            title: "Filler Word",
            description: 'Used "Uhm" during pause.',
            type: "negative",
            icon: "error",
        },
        {
            timestamp: "1:20",
            title: "Repetitive Gesture",
            description: "Hand movement is distracting.",
            type: "negative",
            icon: "pan_tool",
        },
        {
            timestamp: "2:15",
            title: "Good Pace",
            description: "Strong finish with clear summary.",
            type: "positive",
            icon: "speed",
        },
    ],
    summary:
        "Great presentation! Your pace and clarity were excellent. Focus on maintaining eye contact during transitions.",
};

