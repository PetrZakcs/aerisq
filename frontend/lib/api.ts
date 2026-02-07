/**
 * AerisQ API Client
 * Handles all communication with the backend API
 */

// In production (Vercel), API is on same origin at /api
// In development, use localhost:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? '' // Same origin in production
        : 'http://localhost:8000'
);

// Token storage keys
const TOKEN_KEY = 'aerisq_token';
const USER_KEY = 'aerisq_user';

// Types
export interface Token {
    access_token: string;
    token_type: string;
}

export interface User {
    email: string;
    is_active: boolean;
}

export interface GeoJSONGeometry {
    type: string;
    coordinates: number[][][];
}

export interface DateRange {
    start: string;
    end: string;
}

export interface AnalyzeRequest {
    polygon: GeoJSONGeometry;
    date_range: DateRange;
}

export interface DroughtStats {
    mean_sigma0_db: number;
    min_sigma0_db: number;
    max_sigma0_db: number;
    std_sigma0_db?: number;
    median_sigma0_db?: number;
    drought_percentage: number;
    drought_severity: string;
    soil_moisture_index?: number;
    area_km2: number;
    valid_pixel_count?: number;
    polarization?: string;
    confidence?: number;
    anomaly_db?: number;
    baseline_mean_db?: number;
    quality_flag?: string;
    physics_version?: string;
}

export interface JobResult {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    completed_at?: string;
    stats?: DroughtStats;
    summary?: string;
    result_url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geojson?: any;
    error_message?: string;
}

export interface LegendItem {
    severity: string;
    color: string;
    label: string;
    range: string;
}

// Token management
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============ AUTH API ============

export async function login(email: string, password: string): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(error.detail || 'Invalid credentials');
    }

    const data: Token = await response.json();
    setToken(data.access_token);

    // Fetch user info
    const user = await getCurrentUser();
    setStoredUser(user);

    return data;
}

export async function logout(): Promise<void> {
    removeToken();
}

export async function getCurrentUser(): Promise<User> {
    return apiRequest<User>('/api/auth/me');
}

export async function verifyToken(): Promise<boolean> {
    try {
        await apiRequest('/api/auth/verify', { method: 'POST' });
        return true;
    } catch {
        removeToken();
        return false;
    }
}

// ============ ANALYSIS API ============

export async function createAnalysis(request: AnalyzeRequest): Promise<{ job_id: string; status: string }> {
    return apiRequest('/api/v1/analyze', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

export async function createDemoAnalysis(request: AnalyzeRequest): Promise<{ job_id: string; status: string }> {
    return apiRequest('/api/v1/analyze/demo', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

export async function getJobStatus(jobId: string): Promise<JobResult> {
    return apiRequest(`/api/v1/jobs/${jobId}`);
}

export async function getJobStatusPublic(jobId: string): Promise<JobResult> {
    return apiRequest(`/api/v1/jobs/${jobId}/public`);
}

export async function getLegend(): Promise<{ legend: LegendItem[]; threshold_db: number }> {
    return apiRequest('/api/v1/legend');
}

// ============ HEALTH CHECK ============

export async function checkHealth(): Promise<{ status: string; mode?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
}

// ============ POLLING HELPER ============

export async function pollJobUntilComplete(
    jobId: string,
    onUpdate?: (job: JobResult) => void,
    intervalMs: number = 2000,
    maxAttempts: number = 60
): Promise<JobResult> {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const job = await getJobStatusPublic(jobId);

        if (onUpdate) {
            onUpdate(job);
        }

        if (job.status === 'completed' || job.status === 'failed') {
            return job;
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
    }

    throw new Error('Job polling timeout');
}
