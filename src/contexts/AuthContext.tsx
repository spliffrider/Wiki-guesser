// Wiki Guesser - Auth Context

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { Profile } from '@/types/database';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (email: string, password: string, username?: string) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
    updateEmail: (newEmail: string) => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = getSupabaseClient();

    // Fetch user profile
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    };

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise<null>((resolve) => {
                    setTimeout(() => resolve(null), 5000);
                });

                const sessionPromise = supabase.auth.getSession().then(res => res.data.session);
                const session = await Promise.race([sessionPromise, timeoutPromise]);

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const userProfile = await fetchProfile(session.user.id);
                    setProfile(userProfile);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const userProfile = await fetchProfile(session.user.id);
                    setProfile(userProfile);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, username?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (!error && data.user && username) {
            // Update profile with username
            // Using 'as any' to bypass strict Supabase type inference that causes 'never' type error on Vercel
            await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('profiles') as any)
                .update({ username })
                .eq('id', data.user.id);
        }

        return { error };
    };

    const signIn = async (email: string, password: string) => {
        console.log('[Auth] Attempting sign in...');
        console.log('[Auth] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

        try {
            // Add timeout to detect hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Auth timeout after 10 seconds')), 10000);
            });

            const authPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('[Auth] Calling Supabase auth...');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await Promise.race([authPromise, timeoutPromise]) as any;

            console.log('[Auth] Sign in result:', result.error ? result.error.message : 'success');
            return { error: result.error };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('[Auth] Sign in exception:', message);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return { error: { message: message || 'Network error - please try again' } as any };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) {
            return { error: new Error('No user logged in') };
        }

        const { error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (!error) {
            setProfile(prev => prev ? { ...prev, ...updates } : null);
        }

        return { error: error ? new Error(error.message) : null };
    };

    const refreshProfile = async () => {
        if (!user) return;
        const userProfile = await fetchProfile(user.id);
        setProfile(userProfile);
    };

    const updateEmail = async (newEmail: string) => {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        return { error: error ? new Error(error.message) : null };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                signUp,
                signIn,
                signOut,
                updateProfile,
                updateEmail,
                refreshProfile,
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
