# Database Schema for Keycloak Integration

To support Keycloak integration, you need to add the following table to your database schema:

## Table: verified_user_authentications

This table stores associations between Keycloak identities and internal user IDs.

```sql
CREATE TABLE IF NOT EXISTS verified_user_authentications (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    provider VARCHAR(50) NOT NULL,
    login_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    UNIQUE (provider, login_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verified_user_auth_account_id ON verified_user_authentications(account_id);
CREATE INDEX IF NOT EXISTS idx_verified_user_auth_provider_login ON verified_user_authentications(provider, login_name);

-- Add Hasura permissions
COMMENT ON TABLE verified_user_authentications IS 'E''Authentication identities linked to user accounts''';
```

### Column Descriptions

- `id`: Unique identifier for the authentication record
- `account_id`: The internal user ID from the accounts table
- `provider`: Authentication provider name (e.g., "keycloak")
- `login_name`: Identity within that provider (Keycloak subject ID)
- `created_at`: When the association was created
- `verified`: Whether this authentication method has been verified

### Example Usage

```sql
-- Link a Keycloak identity to an internal user ID
INSERT INTO verified_user_authentications (account_id, provider, login_name, verified)
VALUES (123, 'keycloak', 'f8392-4832f-4fsew-4832f', TRUE);

-- Find a user by their Keycloak identity
SELECT a.* 
FROM accounts a
JOIN verified_user_authentications v ON a.id = v.account_id
WHERE v.provider = 'keycloak' AND v.login_name = 'f8392-4832f-4fsew-4832f';

-- Get all authentication methods for a user
SELECT * FROM verified_user_authentications
WHERE account_id = 123;
```

## Hasura Configuration

If you're using Hasura GraphQL API, you'll need to:

1. Create the table in your database
2. Track the table in Hasura Console
3. Set up appropriate permissions

### Example Permission Configuration

#### Select Permissions (for logged-in users)

- Filter: `{"account_id": {"_eq": "X-Hasura-User-Id"}}`
- Columns: `id, provider, login_name, created_at, verified`

#### Insert Permissions (for admin only)

Restrict insert operations to admin roles or server functions.

#### Update Permissions (for admin only)

Restrict update operations to admin roles or server functions.

#### Delete Permissions (for admin only)

Restrict delete operations to admin roles or server functions.