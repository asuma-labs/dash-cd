export interface User {
    id: string;
    username: string;
    email?: string;
    phone_number?: string;
    level?: number;
    exp?: number;
    gold?: number;
    avatar?: string;
    role?: string;
    created_at?: string;
    last_login?: string;
}

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    password: string;
    phone_number?: string;
    email?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}
