import Keycloak, { KeycloakConfig, KeycloakInitOptions, KeycloakProfile } from 'keycloak-js';

/**
 * Keycloak initialization result interface
 */
interface KeycloakInitResult {
  keycloak: Keycloak;
  authenticated: boolean;
}

/**
 * Initialize Keycloak instance
 * @returns A new Keycloak instance
 */
const initKeycloak = (): Keycloak => {
  const config: KeycloakConfig = {
    url: 'http://localhost:8080',
    realm: 'koordinator',
    clientId: 'koordinator-webapp',
  };
  return new Keycloak(config);
};

let keycloak: Keycloak | undefined;

/**
 * Get or initialize Keycloak
 * @returns The Keycloak instance
 */
export const getKeycloak = (): Keycloak => {
  if (!keycloak) {
    keycloak = initKeycloak();
  }
  return keycloak;
};

/**
 * Initialize Keycloak with silent check-sso
 * @returns Promise resolving to authentication status
 */
export const initializeKeycloak = (): Promise<KeycloakInitResult> => {
  const keycloakInstance = getKeycloak();
  return new Promise((resolve, reject) => {
    const initOptions: KeycloakInitOptions = {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    };
    
    keycloakInstance
      .init(initOptions)
      .then((authenticated: boolean) => {
        resolve({ keycloak: keycloakInstance, authenticated });
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
};

/**
 * Function to handle login
 */
export const login = (): void => {
  const keycloakInstance = getKeycloak();
  keycloakInstance.login();
};

/**
 * Function to handle logout
 */
export const logout = (): void => {
  const keycloakInstance = getKeycloak();
  keycloakInstance.logout();
};

/**
 * Function to handle account management
 */
export const accountManagement = (): void => {
  const keycloakInstance = getKeycloak();
  keycloakInstance.accountManagement();
};

/**
 * Function to get user profile
 * @returns Promise resolving to user profile
 */
export const getUserProfile = (): Promise<KeycloakProfile> => {
  const keycloakInstance = getKeycloak();
  return new Promise((resolve, reject) => {
    keycloakInstance
      .loadUserProfile()
      .then((profile: KeycloakProfile) => {
        resolve(profile);
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
};

/**
 * Function to get authentication token
 * @returns The authentication token
 */
export const getToken = (): string | undefined => {
  const keycloakInstance = getKeycloak();
  return keycloakInstance.token;
};

/**
 * Function to check if user has a specific role
 * @param role - The role to check
 * @returns True if the user has the role
 */
export const hasRole = (role: string): boolean => {
  const keycloakInstance = getKeycloak();
  return keycloakInstance.hasRealmRole(role);
};

/**
 * Function to check if the token needs to be refreshed
 * @param minValidity - Minimum validity time in seconds
 * @returns Promise resolving to whether the token was refreshed
 */
export const updateToken = (minValidity: number = 5): Promise<boolean> => {
  const keycloakInstance = getKeycloak();
  return new Promise((resolve, reject) => {
    keycloakInstance
      .updateToken(minValidity)
      .then((refreshed: boolean) => {
        resolve(refreshed);
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
};