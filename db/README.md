# Database Migration System

This directory contains the database migration system for Koordinator2000. It uses a simple Node.js-based approach to manage schema changes and seed data.

## Directory Structure

- `/db/migrations/` - Contains all database migration files
- `/db/seeds/` - Contains seed data files
- `/migrate.js` - Script to apply migrations
- `/create-migration.js` - Script to create new migration files
- `/rollback.js` - Script to roll back migrations
- `/seed.js` - Script to apply seed data

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed, then install the dependencies:

```
cd db
npm install
```

### Configuration

Create a `.env` file in the project root with your database connection string:

```
DATABASE_URL=postgres://username:password@hostname:port/database
```

## Usage

### Creating a Migration

To create a new migration file:

```
npm run migrate:create -- --name="description_of_change"
```

This will create a timestamped SQL file in the `migrations` directory.

### Running Migrations

To apply all pending migrations:

```
npm run migrate
```

To migrate to a specific version:

```
npm run migrate -- --to=YYYYMMDDHHMMSS
```

### Rolling Back Migrations

To roll back the most recent migration:

```
npm run migrate:rollback
```

To roll back multiple migrations:

```
npm run migrate:rollback -- --steps=3
```

To roll back to a specific version:

```
npm run migrate:rollback -- --to=YYYYMMDDHHMMSS
```

### Applying Seed Data

To apply all seed files:

```
npm run seed
```

To apply a specific seed file:

```
npm run seed -- --file=001_example_data.sql
```

## Best Practices

1. **Make migrations atomic**: Each migration should do one thing and do it well.
2. **Use transactions**: Migrations should be wrapped in transactions to ensure they're applied completely or not at all.
3. **Test migrations**: Before applying to production, test on a staging environment.
4. **Keep migrations small**: Smaller migrations are easier to understand and troubleshoot.
5. **Include both up and down operations**: Always provide a way to roll back changes.
6. **Prefer alterations to deletions**: Avoid dropping data when possible.

## Migration Naming Convention

Migration files follow this format:

```
YYYYMMDDHHMMSS_descriptive_name.sql
```

For example: `20250326120000_add_user_roles.sql`

## Running Migrations in Different Environments

Migrations should be run separately from the application services:

- **Development**: Run migrations manually before starting the application
- **Staging/Production**: Run migrations as part of the deployment process, before starting any services

**Important**: The services themselves do not run migrations. Migrations are a separate step in your workflow/deployment process.

### Using the Deployment Script

For automated deployments, use the included deployment script:

```
# Run from the db directory
npm run deploy

# Or install globally and run from anywhere
npm link
koordinator-db-deploy
```

This script handles running migrations in a production-safe way and can be integrated into CI/CD pipelines.

## Initial Schema

The initial schema is based on the existing PostgreSQL database dump located in `/data/koordinator.sql`. It represents the starting point for future migrations.