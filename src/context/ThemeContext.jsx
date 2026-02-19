import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem('peptide_theme');
        if (saved) return saved;
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('peptide_theme', theme);
    }, [theme]);

    // Sync with Supabase profile if logged in
    useEffect(() => {
        const syncTheme = async () => {
            if (user) {
                try {
                    const { data } = await supabase
                        .from('profiles')
                        .select('theme_preference')
                        .eq('id', user.id)
                        .single();

                    if (data?.theme_preference) {
                        setTheme(data.theme_preference);
                    }
                } catch (error) {
                }
            }
        };
        syncTheme();
    }, [user]);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Save to Supabase if logged in
        if (user) {
            try {
                await supabase
                    .from('profiles')
                    .update({ theme_preference: newTheme })
                    .eq('id', user.id);
            } catch (error) {
                console.error('Error saving theme preference:', error);
            }
        }
    };

    const setThemeMode = async (newTheme) => {
        setTheme(newTheme);
        if (user) {
            try {
                await supabase
                    .from('profiles')
                    .update({ theme_preference: newTheme })
                    .eq('id', user.id);
            } catch (error) {
                console.error('Error saving theme preference:', error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
