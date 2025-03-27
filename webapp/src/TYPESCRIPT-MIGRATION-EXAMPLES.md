# TypeScript Migration Examples

This document provides examples of how to migrate specific files from JavaScript to TypeScript.

## Example 1: Converting `stuff.js` to TypeScript

**Before (JavaScript):**

```javascript
// stuff.js
import {my_user} from './my_user.js';
import {gql} from "$lib/apollo.js";
import sanitizeHtml from 'sanitize-html';
import {readable, writable, get} from 'svelte/store';
import {browser} from '$app/environment';

export function sanitize_html(x)
{
  return sanitizeHtml(x, {disallowedTagsMode: 'escape'});
}

export function get_status_class(participation)
{
  if (participation.condition_is_fulfilled)
  {
    if (participation.confirmed)
    {
      return "confirmed"
    }
    else
      return "condition_is_fulfilled"
  }
  else
    return "condition_is_not_fulfilled"
}

export function get_tickmark(participation)
{
  if (!participation || participation.threshold === undefined)
    return ""
  else
  {
    if (participation.condition_is_fulfilled)
    {
      if (participation.confirmed)
      {
        return '✅'
      }
      else
        return "✉" // "☑?"
    }
    else
      return "👁"
  }
}
```

**After (TypeScript):**

```typescript
// stuff.ts
import { my_user } from './my_user';
import { gql } from "$lib/apollo.js";
import sanitizeHtml from 'sanitize-html';
import { readable, writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { Participation } from './types';

export function sanitize_html(x: string): string {
  return sanitizeHtml(x, { disallowedTagsMode: 'escape' });
}

export function get_status_class(participation: Participation, collect_confirmations = true): string {
  if (participation.condition_is_fulfilled) {
    if (!collect_confirmations || participation.confirmed) {
      return "confirmed";
    } else {
      return "condition_is_fulfilled";
    }
  } else {
    return "condition_is_not_fulfilled";
  }
}

export function get_tickmark(participation: Participation, collect_confirmations = true): string {
  if (!participation || participation.threshold === undefined)
    return "";
  else {
    if (participation.condition_is_fulfilled) {
      if (!collect_confirmations || participation.confirmed) {
        return '✅';
      } else {
        return "✉"; // "☑?"
      }
    } else {
      return "👁";
    }
  }
}
```

## Example 2: Converting a Svelte Component

**Before (JavaScript):**

```svelte
<script lang='js'>
  import MutationForm from './MutationForm.svelte';
  import gql from 'graphql-tag';
  import {my_user} from '../my_user.js';
  
  export let campaign;
  
  const ADD = gql`
  mutation MyMutation(
      $title: String = ""
    )
    {
      insert_campaigns_one(object: {
        title: $title
      })
      {
        id
        }
    }
  `;
</script>
```

**After (TypeScript):**

```svelte
<script lang='ts'>
  import MutationForm from './MutationForm.svelte';
  import gql from 'graphql-tag';
  import { my_user } from '../my_user';
  import type { Campaign } from '../types';
  
  export let campaign: Campaign;
  
  const ADD = gql`
  mutation MyMutation(
      $title: String = ""
    )
    {
      insert_campaigns_one(object: {
        title: $title
      })
      {
        id
        }
    }
  `;
</script>
```

## Example 3: Adding Type Definitions for GraphQL Queries

```typescript
// types/graphql.ts
import type { Campaign, Participation } from './campaign';

export interface CampaignListQuery {
  campaigns: Campaign[];
}

export interface CampaignDetailQuery {
  campaigns_by_pk: Campaign;
}

export interface ParticipationQuery {
  participations: Participation[];
}

export interface MutationResponse {
  affected_rows: number;
}
```

## Tips for Conversion

1. Start by adding types to function parameters and return values
2. Use interfaces to describe complex objects
3. For any external libraries without type definitions, use declaration files (e.g., `declare module 'some-module'`)
4. Use type annotations for class properties and reactive variables
5. Update imports to refer to types when needed

## Common TypeScript Patterns Used in the Project

### Type Guards

```typescript
function isCampaign(obj: any): obj is Campaign {
  return obj && typeof obj === 'object' && 'title' in obj && 'id' in obj;
}

// Usage
if (isCampaign(someObject)) {
  // TypeScript now knows someObject is a Campaign
  console.log(someObject.title);
}
```

### Utility Types

```typescript
// Partial type - all properties are optional
type PartialCampaign = Partial<Campaign>;

// Pick specific properties
type CampaignPreview = Pick<Campaign, 'id' | 'title' | 'description'>;

// Omit specific properties
type CampaignWithoutDismissals = Omit<Campaign, 'campaign_dismissals'>;
```