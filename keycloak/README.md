# Keycloak Integration for Koordinator

## Current Progress

- Added Keycloak and PostgreSQL database to docker-compose.yml
- Created initial Keycloak realm configuration
- Set up the basic structure for Keycloak client-side authentication

## Important Notes

- Keycloak will NOT replace the existing JWT logic
- `init_keys` serves a different purpose and should be maintained
- Keycloak will be used for additional verification of users
- User verification/reputation data will be stored in our own database

## Next Steps

1. **Finish Client Integration**
   - Complete the KeycloakLogin.svelte component
   - Integrate with the existing authentication flow

2. **Database Integration**
   - Create schema for storing user verification status
   - Add tables to track user reputation based on Keycloak verification

3. **Server-Side Logic**
   - Update the auth flow to use Keycloak as a secondary verification
   - Maintain existing JWT logic for primary authentication

4. **Testing and Deployment**
   - Test both auth flows in development
   - Configure for production with proper secrets and URLs

## How to Run

```bash
# Start the Keycloak server and database
docker compose up keycloak-db keycloak

# Access the Keycloak admin console
# URL: http://localhost:8080/
# Username: admin
# Password: admin_password
```

## Realm Configuration

The initial realm configuration includes:

- Realm name: koordinator
- Client ID: koordinator-webapp
- Test users: test_user and admin_user
- Roles: user and admin

## Security Considerations

- Change the default passwords before production use
- Configure proper SSL for production
- Review and adjust token lifetimes as needed