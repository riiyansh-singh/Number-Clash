import { UserProfile, LeaderboardEntry, DailyChallengeData, CosmeticItem } from '../types';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('number_clash_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('number_clash_token', token);
    } else {
      localStorage.removeItem('number_clash_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public logout() {
    this.setToken(null);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data;
  }

  public async getMe(): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>('/api/auth/me');
  }

  public async getProfile(): Promise<UserProfile> {
    const res = await this.getMe();
    return res.user;
  }

  public async register(username: string, email?: string, password?: string): Promise<{ user: UserProfile; token: string }> {
    const data = await this.request<{ user: UserProfile; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    this.setToken(data.token);
    return data;
  }

  public async login(username: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const data = await this.request<{ user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(data.token);
    return data;
  }

  public async guestLogin(preferredUsername?: string): Promise<{ user: UserProfile; token: string }> {
    const data = await this.request<{ user: UserProfile; token: string }>('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ preferredUsername })
    });
    this.setToken(data.token);
    return data;
  }

  public async updateCosmetics(activeCosmetics: { activeAvatar?: string; activeFrame?: string; activeTitle?: string; activeTheme?: string }): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>('/api/profile/update-cosmetics', {
      method: 'POST',
      body: JSON.stringify(activeCosmetics)
    });
  }

  public async getCosmeticsCatalog(): Promise<{ catalog: CosmeticItem[] }> {
    return this.request<{ catalog: CosmeticItem[] }>('/api/cosmetics/catalog');
  }

  public async buyCosmetic(itemId: string): Promise<{ success: boolean; user: UserProfile; message: string }> {
    return this.request<{ success: boolean; user: UserProfile; message: string }>('/api/cosmetics/buy', {
      method: 'POST',
      body: JSON.stringify({ itemId })
    });
  }

  public async getLeaderboard(type: string = 'global', sort: string = 'rating'): Promise<{ leaderboard: LeaderboardEntry[] }> {
    return this.request<{ leaderboard: LeaderboardEntry[] }>(`/api/leaderboard?type=${type}&sort=${sort}`);
  }

  public async getDailyChallenge(): Promise<DailyChallengeData> {
    return this.request<DailyChallengeData>('/api/daily-challenge');
  }

  public async recordMatch(matchData: {
    mode: string;
    difficulty: string;
    won: boolean;
    attempts: number;
    maxAttempts: number;
    durationSeconds: number;
    secretNumber: number;
    aiDifficulty?: string;
  }): Promise<{ user: UserProfile; matchResult: any }> {
    return this.request<{ user: UserProfile; matchResult: any }>('/api/match/record', {
      method: 'POST',
      body: JSON.stringify(matchData)
    });
  }

  public async getAIMove(difficulty: string, minRange: number, maxRange: number, secretNumber?: number): Promise<{ guess: number; reasoning: string }> {
    return this.request<{ guess: number; reasoning: string }>('/api/ai/guess', {
      method: 'POST',
      body: JSON.stringify({ difficulty, minRange, maxRange, secretNumber })
    });
  }
}

export const api = new ApiClient();
