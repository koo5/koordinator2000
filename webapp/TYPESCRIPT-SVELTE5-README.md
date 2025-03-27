# TypeScript & Svelte 5 Migration

This project has been upgraded to use TypeScript and Svelte 5, along with SvelteKit 2 and Vite 6.

## Demo Page

To see the TypeScript and Svelte 5 Runes in action, visit the [Svelte 5 Demo Page](/svelte5-demo) which showcases:

- Legacy vs Runes API comparison
- Typed components in both styles
- Campaign Card component with TypeScript
- Pagination component with Runes and type safety

## Key Changes

- **TypeScript Integration**: Added static type checking
- **Svelte 5 Upgrade**: Latest version with runes support
- **SvelteKit 2**: Updated routing and API
- **Vite 6**: Faster builds and better optimizations

## Migration Status

The migration is a work in progress. Here's what has been completed:

- Configuration setup for TypeScript and Svelte 5
- Core type definitions created
- Several key files converted to TypeScript
- Example components using both legacy and runes API
- Documentation for migration process

## Documentation

The following documentation has been created to help with the migration:

- [TypeScript Migration Guide](./TYPESCRIPT-MIGRATION-GUIDE.md): Guide for TypeScript adoption
- [Svelte 5 TypeScript Guide](./SVELTE5-TYPESCRIPT-GUIDE.md): Svelte 5 with TypeScript features
- [TypeScript Migration Examples](./TYPESCRIPT-MIGRATION-EXAMPLES.md): Examples of converting JavaScript to TypeScript
- [Svelte Update Guide](./SVELTE-UPDATE-GUIDE.md): Guide for updating from Svelte 3 to Svelte 5
- [Progress and Next Steps](./PROGRESS-AND-NEXT-STEPS.md): Overview of progress and what to do next
- [Upgrade Summary](./UPGRADE-SUMMARY.md): Summary of all changes made

## Example Components

- Traditional Components with TypeScript:
  - `/src/components/Campaign.svelte`
  - `/src/components/AddCampaign.svelte`
  - `/src/components/ParticipationBadge.svelte`

- Svelte 5 Runes with TypeScript:
  - `/src/components/examples/TypedComponent.svelte`
  - `/src/components/examples/CampaignCard.svelte`
  - `/src/components/examples/Pagination.svelte`
  
- UI Component Library:
  - `/src/components/ui/Button.svelte`
  - `/src/components/ui/Card.svelte`
  - `/src/components/ui/Badge.svelte`
  - `/src/components/ui/README.md` (documentation)

## Type Definitions

- Campaign and Participation types: `/src/types/campaign.ts`
- User type: `/src/types/user.ts`
- GraphQL types: `/src/types/graphql.ts`
- Utility type declarations: `/src/types/utilities.d.ts`

## Tools

- **js-to-ts-converter.sh**: Script to help convert JS files to TS
- **.editorconfig**: Ensures consistent formatting
- **npm scripts**:
  - `npm run check`: Run TypeScript checks
  - `npm run check:watch`: Run TypeScript checks in watch mode
  - `npm run typecheck`: Run standalone TypeScript checking

## Getting Started with TypeScript

1. **Add types to variables**:
   ```typescript
   let title: string = 'Hello';
   let count: number = 42;
   ```

2. **Add types to functions**:
   ```typescript
   function greet(name: string): string {
     return `Hello, ${name}!`;
   }
   ```

3. **Use interfaces for objects**:
   ```typescript
   interface User {
     id: number;
     name: string;
     email?: string; // Optional property
   }
   
   function getUser(id: number): User {
     // ...
   }
   ```

## Using Svelte 5 Runes

1. **State Management**:
   ```typescript
   const count = $state(0);
   
   function increment() {
     count++;
   }
   ```

2. **Props with TypeScript**:
   ```typescript
   const props = $props<{
     title: string;
     optional?: boolean;
   }>();
   ```

3. **Derived Values**:
   ```typescript
   const doubled = $derived(count * 2);
   ```

4. **Side Effects**:
   ```typescript
   $effect(() => {
     console.log(`Count changed to ${count}`);
   });
   ```

## Next Steps

See [PROGRESS-AND-NEXT-STEPS.md](./PROGRESS-AND-NEXT-STEPS.md) for a detailed roadmap.

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Svelte 5 Documentation](https://svelte-5-preview.vercel.app/docs/introduction)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)