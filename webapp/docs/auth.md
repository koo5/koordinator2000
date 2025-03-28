# Authentication System Design for Koordinator2000

## Overview

This document outlines the authentication system design for Koordinator2000. The system provides a frictionless user experience by automatically assigning identities while supporting integration with Keycloak for formal authentication methods.

## Core Philosophy

Every visitor to Koordinator2000 is automatically assigned an identity via JWT upon their first visit, which persists as long as their browser storage allows. This "immediate identity" approach removes barriers to entry while still supporting integration with Keycloak for more formal authentication. Users can begin interacting with the system immediately, and later authenticate via Keycloak to establish a verified identity.

## Design Principles

1. **Immediate Identity Assignment**: New users receive a JWT identity immediately upon first visit
2. **JWT-Based Core**: All authentication is based on JSON Web Tokens (JWT)
3. **Keycloak Integration**: External authentication handled by Keycloak
4. **Identity Association**: Keycloak identities can be associated with existing JWT identities
5. **Persistence**: User identities persist across sessions via browser storage
6. **Zero Friction**: Users can interact with the system before formal authentication

## User Identity Lifecycle

### 1. Initial Visit
- User visits the site for the first time
- System automatically assigns a JWT identity via `/get_free_user_id`
- This identity is stored in browser local storage
- User can immediately begin interacting with the site

### 2. Authentication via Keycloak

- User chooses to authenticate via Keycloak
- System redirects to Keycloak login
- User authenticates with Keycloak (username/password, social login, etc.)
- Keycloak redirects back to application with authentication token
- System receives the event containing Keycloak identity information
- System checks if the Keycloak identity is already associated with a user in our database
- If associated, system replaces current JWT with the associated identity
- If not associated, system associates the Keycloak identity with the current JWT identity

### 3. Identity Management

- Keycloak authentication methods are associated with JWT identities
- Associations are stored in the database for future login options
- Associations help calculate "account validity" (for example, verified email status)

## Core Components

### 1. JWT Token System

- **Token Generation**: Server creates signed JWTs using asymmetric cryptography (RSA)
- **Token Validation**: Tokens are validated on both client and server sides
- **Token Payload**:
  - User ID
  - Issuer
  - Audience
  - Expiration time
- **Key Management**: Private keys stored securely on server side, public keys available for verification

### 2. Identity Association Mechanism

- **Database Schema**: Stores associations between JWT identities and Keycloak identities
- **Association Table**: `verified_user_authentications` links Keycloak subjects to internal user IDs
- **Verification Status**: Tracks which authentication methods are verified

### 3. Keycloak Integration

- **OIDC/OAuth2**: Integration with Keycloak via standard protocols
- **Identity Mapping**: Maps Keycloak subjects to internal user IDs
- **User Attributes**: Syncs relevant user attributes from Keycloak to our system
- **Authentication Events**: System processes authentication events from Keycloak

### 4. Authentication Flows

#### First Visit Flow:
1. User visits the site for the first time
2. System generates new user ID via `/get_free_user_id`
3. System issues JWT token for this identity
4. Client stores JWT token in local storage
5. User can immediately begin using the site

#### Keycloak Authentication Flow:
1. User initiates authentication via Keycloak
2. System redirects to Keycloak login
3. User authenticates with Keycloak
4. Keycloak redirects back with authentication token
5. System receives authentication event
6. System checks for existing association in database
7. If found, issues JWT for associated identity
8. If not found, associates Keycloak identity with current JWT identity

## API Endpoints

- **/get_free_user_id**: Generates a new user ID with JWT token
- **/auth_event**: Processes authentication events from Keycloak

## Authentication Association Database

The system uses a `verified_user_authentications` table to store associations:

- `account_id`: Internal user ID
- `provider`: Authentication provider (e.g., "keycloak", "auth0" for legacy support)
- `login_name`: Identity within that provider (Keycloak subject ID)
- `verified`: Whether this authentication method has been verified

## Implementation Details

### JWT Handling

- **Signing**: JWTs are signed using RSA private key
- **Verification**: JWTs are verified using corresponding public key
- **Storage**: JWTs are stored in browser localStorage
- **Expiration**: JWTs expire after 2 hours

### Keycloak Integration

- **Realm Configuration**: Custom realm for Koordinator2000
- **Client Configuration**: SvelteKit application registered as client
- **User Federation**: Optional integration with external user directories
- **Identity Brokering**: Support for social/external identity providers through Keycloak

## Security Considerations

- **Multiple Identities**: Users might have multiple JWT identities if using different browsers/devices
- **Identity Merging**: Future enhancement may allow consolidating multiple identities
- **Account Takeover**: Measures to prevent claiming someone else's temporary identity
- **HTTPS**: All communication encrypted via HTTPS
- **Token Storage**: Security limitations of browser local storage
- **Token Revocation**: Keycloak integration for token revocation

## Future Enhancements

1. Identity consolidation/merging capabilities
2. Enhanced security for localStorage (consider HttpOnly cookies)
3. Advanced user roles and permissions system
4. Improved token refresh mechanism
5. Tools for users to manage their authentication methods
6. Enhanced Keycloak integration for attribute sync