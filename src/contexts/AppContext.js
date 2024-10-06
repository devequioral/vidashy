import React, { createContext, useContext, useEffect, useReducer } from 'react';

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
  createCollectionAttempt: 0,
  organizations: [],
  organizationSelected: 0,
  refreshOrganizations: 0,
};

let reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DEVICE': {
      return {
        ...state,
        device: action.device,
      };
    }
    case 'SET_THEME': {
      saveTheme(action.theme);
      return {
        ...state,
        theme: action.theme,
      };
    }
    case 'CREATE_COLLECTION_ATTEMPT': {
      return {
        ...state,
        createCollectionAttempt: action.createCollectionAttempt,
      };
    }
    case 'SET_ORGANIZATION_SELECTED': {
      return {
        ...state,
        organizationSelected: action.organizationSelected,
      };
    }
    case 'SET_ORGANIZATIONS': {
      return {
        ...state,
        organizations: action.organizations,
      };
    }
    case 'REFRESH_ORGANIZATIONS':
      {
        return {
          ...state,
          refreshOrganizations: action.refreshOrganizations,
        };
      }

      throw Error('Unknown action: ' + action.type);
  }
};

async function listOrganizations() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list?page=1&pagesize=50`;
  return await fetch(url);
}

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  const fetchOrganizations = async () => {
    const resp = await listOrganizations();
    if (resp.ok) {
      const resp_json = await resp.json();
      const { data } = resp_json;
      if (data && data.records && data.records.length > 0) {
        const _organizations = [];
        data.records.map((org) => {
          _organizations.push({
            name: org.name,
            id: org.id,
          });
        });
        dispatch({
          type: 'SET_ORGANIZATIONS',
          organizations: _organizations,
        });
      }
    }
  };
  useEffect(() => {
    fetchOrganizations();
  }, [state.refreshOrganizations]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider, useAppContext };
