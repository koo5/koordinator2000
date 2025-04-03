# Keycloak Integration

This document explains how to set up and use Keycloak integration with Koordinator.

## Overview

Koordinator uses a hybrid authentication system:

1. **Automatic Identity**: Every visitor gets a free user ID with JWT on their first visit
2. **Keycloak Integration**: Users can link their automatic identity with a Keycloak account
3. **Identity Association**: Keycloak identities are associated with internal user IDs

## Keycloak Setup

### 1. Set Up a Keycloak Server

1. Install and run a Keycloak server instance
   ```bash
   # Example with Docker
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```

2. Access the Keycloak admin console at http://localhost:8080/admin
3. Log in with the admin credentials

### 2. Create a Realm

1. In the Keycloak admin console, create a new realm (e.g., "koordinator")
2. Configure the realm settings as needed

### 3. Create a Client

1. In your realm, go to "Clients" and click "Create"
2. Set the Client ID to "koordinator-app" (or match your environment variable)
3. Set the Client Protocol to "openid-connect"
4. Set the Access Type to "confidential"
5. Set the Valid Redirect URIs to include your application URLs, for example:
   - http://localhost:5000/*
   - https://your-production-domain.com/*
6. Enable "Standard Flow" and "Direct Access Grants"
7. Save the client

### 4. Get Client Secret

1. After creating the client, go to the "Credentials" tab
2. Copy the client secret
3. Add it to your .env file as KEYCLOAK_CLIENT_SECRET

### 5. Configure Environment Variables

Update your .env file with the following:

```
VITE_PUBLIC_ENABLE_KEYCLOAK="true"
VITE_PUBLIC_KEYCLOAK_URL="http://localhost:8080"
VITE_PUBLIC_KEYCLOAK_REALM="koordinator"
VITE_PUBLIC_KEYCLOAK_CLIENT_ID="koordinator-app"
KEYCLOAK_CLIENT_SECRET="your-client-secret"
```

## Authentication Flow

### 1. New User Visit

1. User visits the site for the first time
2. System automatically assigns a user ID and JWT
3. User can immediately start using the site

### 2. Keycloak Authentication

1. User chooses to link their account with Keycloak
2. User authenticates with Keycloak (username/password or social login)
3. On successful authentication:
   - If the Keycloak identity is already associated with a user ID, the user's JWT is replaced with that associated identity
   - If the Keycloak identity is not yet associated, it's linked to the current user ID

### 3. Future Visits

1. User returns to the site
2. If the user has a valid JWT, they continue using their existing identity
3. If they authenticate with Keycloak, they'll access their linked account

## Identity Management

Users can manage their Keycloak identity from the Settings page:

1. Link a new Keycloak identity
2. View their linked Keycloak information
3. Unlink their Keycloak identity
4. Access their Keycloak account management page

## Database Schema

The system uses a `verified_user_authentications` table with the following structure:

- `account_id`: Internal user ID
- `provider`: Authentication provider (e.g., "keycloak")
- `login_name`: Identity within that provider (Keycloak subject ID)

## Adding Social Login

To enable social login through Keycloak:

1. In the Keycloak admin console, go to "Identity Providers"
2. Add providers like Google, Facebook, GitHub, etc.
3. Configure the providers with their respective client IDs and secrets
4. Users can now use these social logins with your application

## Troubleshooting

- **Silent Check SSO Issues**: Ensure the silent-check-sso.html file is properly served
- **CORS Errors**: Configure Keycloak's CORS settings in the admin console
- **Redirect Issues**: Verify the Valid Redirect URIs in the client settings
- **JWT Issues**: Check that the JWT token is being properly stored and passed