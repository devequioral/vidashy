import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const useAppContext = () => useContext(AppContext);

const getTheme = () => {
  try {
    return localStorage.getItem('ArcticBunker_theme') || 'light';
  } catch (e) {
    return 'light';
  }
};

const saveTheme = (theme) => {
  localStorage.setItem('ArcticBunker_theme', theme);
};

let initialState = {
  device: 'Desktop',
  theme: getTheme(),
};

let reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DEVICE': {
      return {
        ...state,
        device: action.device,
      };
    }
    case 'SET_THEME':
      {
        saveTheme(action.theme);
        return {
          ...state,
          theme: action.theme,
        };
      }

      throw Error('Unknown action: ' + action.type);
  }
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider, useAppContext };
