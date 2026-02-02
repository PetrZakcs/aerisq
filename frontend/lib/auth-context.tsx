'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    login as apiLogin,
    logout as apiLogout,
    getCurrentUser,
    verifyToken,
    getStoredUser,
    getToken,
    User
} from './api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async (): Promise<boolean> => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return false;
        }

        try {
            const isValid = await verifyToken();
            if (isValid) {
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                } else {
                    const fetchedUser = await getCurrentUser();
                    setUser(fetchedUser);
                }
                return true;
            } else {
                setUser(null);
                return false;
            }
        } catch {
            setUser(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await apiLogin(email, password);
            const fetchedUser = await getCurrentUser();
            setUser(fetchedUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
