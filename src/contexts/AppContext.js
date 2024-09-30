import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const useAppContext = () => useContext(AppContext);

let initialState = {
  device: 'Desktop',
  theme: 'light',
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
