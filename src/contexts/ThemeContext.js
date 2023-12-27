import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // default to 'light' theme

  useEffect(() => {
    // This code runs after the component has mounted, which means it runs on the client side.
    const themeDefault = localStorage.getItem('ArcticBunker_theme') || 'light';
    setTheme(themeDefault);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // This code also runs on the client side, so it's safe to use localStorage here.
    localStorage.setItem('ArcticBunker_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
