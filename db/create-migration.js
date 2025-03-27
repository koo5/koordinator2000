const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('name', {
    alias: 'n',
    describe: 'Migration name',
    type: 'string',
    demandOption: true
  })
  .help()
  .argv;

function createMigration() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');
  const migrationName = argv.name.toLowerCase().replace(/\s+/g, '_');
  const fileName = `${timestamp}_${migrationName}.sql`;
  
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const migrationPath = path.join(migrationsDir, fileName);
  
  const templateContent = `-- Migration: ${argv.name}
-- Created at: ${new Date().toISOString()}

-- Write your SQL migration here
-- Write your statements here

-- Example:
-- CREATE TABLE my_table (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );

-- Functions to handle easy rollbacks:
-- Save the current state that we might want to roll back to
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '${timestamp}');
END $$;

-- Save any existing tables we might modify (example)
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'table_to_modify') THEN
--     EXECUTE format('CREATE TABLE _migration_backup_%s.table_to_modify AS SELECT * FROM public.table_to_modify', '${timestamp}');
--   END IF;
-- END $$;

-- Add your migration code here

`;
  
  fs.writeFileSync(migrationPath, templateContent);
  console.log(`Created migration: ${migrationPath}`);
}

createMigration();