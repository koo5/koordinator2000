
# Koordinator Frontend

#### Demo: https://fullcracy.xyz/

## Local Setup

1. Install dependencies:
```
npm i
```

2. Create a `.public_env` file in the project root with the following variables:
```
GRAPHQL_ENDPOINT="https://your-hasura-instance.hasura.app/v1/graphql"
PUBLIC_URL="http://localhost:5000"
PUBLIC_BASE_URL="/"

# Hasura GraphQL Headers - generate Admin Secret in Hasura Cloud
PUBLIC_GRAPHQL_HEADERS='{"content-type":"application/json","x-hasura-admin-secret":"your-hasura-admin-secret"}'

# App keys - generate using node generate_key_pair.mjs
# REQUIRED: This is a server-side secret that must be set (not optional!)
# The application will not start without this environment variable
MY_APP_KEYS='{"private":{"kty":"EC","crv":"P-256","alg":"ES256","x":"...","y":"...","d":"..."},"public":{"kty":"EC","crv":"P-256","alg":"ES256","x":"...","y":"..."}}'
```

3. Generate JWT keys (if needed):
```
node generate_key_pair.mjs
```
Copy the output to PUBLIC_MY_APP_KEYS in your .public_env file.

4. Start the development server:
```
npm run dev
```

## Hasura Cloud Setup

To obtain the required Hasura headers:

1. Login to [Hasura Cloud](https://cloud.hasura.io)
2. Navigate to your project
3. Go to "Project Settings" > "API Access"
4. Generate or copy your Admin Secret
5. Add the Admin Secret to your .public_env file in the PUBLIC_GRAPHQL_HEADERS variable as shown above

For production environments, consider using more restricted permissions with x-hasura-role headers.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production server
- `npm run check` - Run svelte-check for static analysis
- `npm run typecheck` - Run TypeScript type checking

See CLAUDE.md for more detailed development guidelines.

## Svelte 5 and TypeScript Support

This project has been upgraded to use Svelte 5 with TypeScript. The configuration has been designed to allow a gradual migration while maintaining compatibility with existing libraries.

### Key Points:

1. **Opt-In Approach**: We've configured the project to use an opt-in approach for Svelte 5 Runes by disabling global runes mode. To use runes in a component, explicitly add the `runes` attribute to the script tag:

   ```svelte
   <script lang="ts">
     // Now you can use runes here
   </script>
   ```

2. **Compatibility Mode**: The Svelte configuration includes compatibility settings to support both new Svelte 5 components and legacy Svelte 3/4 components.

3. **External Libraries**: Some external libraries (like svelte-apollo) may have compatibility issues with Svelte 5. We've provided wrapper components as needed to bridge these gaps.

For detailed guidance on working with Svelte 5 and TypeScript in this project, see `SVELTE5-TYPESCRIPT-GUIDE.md`.

### UI Component Library

The project includes a comprehensive UI component library built with Svelte 5 Runes and TypeScript. Components include:

- Button
- Card
- Badge
- Input
- Form
- Select
- Checkbox
- TextArea

These components are fully typed and use Svelte 5's reactive primitives. See the component library documentation in `/src/components/ui/README.md` for details and usage examples.

