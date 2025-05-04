'use client';

import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  // Initialize dark mode state as null to avoid SSR issues
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Determine the initial theme after the component mounts
    const storedPreference = localStorage.getItem('theme');
    if (storedPreference) {
      setIsDarkMode(storedPreference === 'dark');
    } else {
      // Fallback to system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemPrefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  useEffect(() => {
    // Apply the theme only when isDarkMode is not null
    if (isDarkMode !== null) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDarkMode]);

  if (isDarkMode === null) {
    // Optionally, render nothing or a loading state until the theme is determined
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
    >
      Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
    </button>
  );
}
