import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  // Initialize dark mode state from localStorage or fallback to system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedPreference = localStorage.getItem('theme');
    if (storedPreference) {
      return storedPreference === 'dark';
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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
      // Force a page reload
      window.location.reload();
      return newMode;
    });
  };
  useEffect(() => {
    // Apply the initial theme based on the state
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
