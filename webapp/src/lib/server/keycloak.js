import Keycloak from 'keycloak-js';

// Initialize Keycloak instance
const initKeycloak = () => {
  return new Keycloak({
    url: 'http://localhost:8080',
    realm: 'koordinator',
    clientId: 'koordinator-webapp',
  });
};

let keycloak;

// Get or initialize Keycloak
export const getKeycloak = () => {
  if (!keycloak) {
    keycloak = initKeycloak();
  }
  return keycloak;
};

// Initialize Keycloak with silent check-sso
export const initializeKeycloak = () => {
  const keycloak = getKeycloak();
  return new Promise((resolve, reject) => {
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      })
      .then((authenticated) => {
        resolve({ keycloak, authenticated });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Function to handle login
export const login = () => {
  const keycloak = getKeycloak();
  keycloak.login();
};

// Function to handle logout
export const logout = () => {
  const keycloak = getKeycloak();
  keycloak.logout();
};

// Function to handle account management
export const accountManagement = () => {
  const keycloak = getKeycloak();
  keycloak.accountManagement();
};

// Function to get user profile
export const getUserProfile = () => {
  const keycloak = getKeycloak();
  return new Promise((resolve, reject) => {
    keycloak
      .loadUserProfile()
      .then((profile) => {
        resolve(profile);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Function to get authentication token
export const getToken = () => {
  const keycloak = getKeycloak();
  return keycloak.token;
};

// Function to check if user has a specific role
export const hasRole = (role) => {
  const keycloak = getKeycloak();
  return keycloak.hasRealmRole(role);
};

// Function to check if the token needs to be refreshed
export const updateToken = (minValidity = 5) => {
  const keycloak = getKeycloak();
  return new Promise((resolve, reject) => {
    keycloak
      .updateToken(minValidity)
      .then((refreshed) => {
        resolve(refreshed);
      })
      .catch((error) => {
        reject(error);
      });
  });
};