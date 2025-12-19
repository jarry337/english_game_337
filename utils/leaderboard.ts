import { LeaderboardEntry } from '../types';

// Using a public KV store for cross-device persistence
// This bucket ID is shared across all instances of the app
const BUCKET_ID = 'KIDS_QUIZ_GLOBAL_V1'; 
const API_URL = `https://kvdb.io/6n5m5m9zN2wKxS3hH2x9x/${BUCKET_ID}`;

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      if (response.status === 404) return []; // Bucket doesn't exist yet
      throw new Error('Failed to fetch leaderboard');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Leaderboard fetch error:', e);
    return [];
  }
};

export const saveScore = async (name: string, score: number): Promise<LeaderboardEntry[]> => {
  try {
    // 1. Get current leaderboard
    const current = await getLeaderboard();
    
    // 2. Add new entry
    const newEntry: LeaderboardEntry = {
      name,
      score,
      date: new Date().toISOString()
    };
    
    const updated = [...current, newEntry]
      .sort((a, b) => b.score - a.score) // Sort descending
      .slice(0, 5); // Keep top 5
    
    // 3. Save back to server
    const saveResponse = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(updated),
    });

    if (!saveResponse.ok) throw new Error('Failed to save score');
    
    return updated;
  } catch (e) {
    console.error('Leaderboard save error:', e);
    return [];
  }
};

export const isHighScore = async (score: number): Promise<boolean> => {
  const current = await getLeaderboard();
  if (current.length < 5) return true;
  return score > current[current.length - 1].score;
};