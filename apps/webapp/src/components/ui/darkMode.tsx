'use client';

import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Check the current theme on mount
    const storedPreference = localStorage.getItem('theme');
    if (storedPreference) {
      setIsDarkMode(storedPreference === 'dark');
    } else {
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

  if (isDarkMode === null) {
    return null; // Optionally render nothing until the theme is determined
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
function initializeTheme() {
  const storedPreference = localStorage.getItem('theme');
  if (storedPreference) {
    if (storedPreference === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}

export function ThemeInitializer() {
  useEffect(() => {
    initializeTheme(); // Initialize the theme globally
  }, []);

  return null; // This component doesn't render anything
}
