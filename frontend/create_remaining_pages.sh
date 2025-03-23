#\!/bin/bash

# Script to ensure all routes have their SvelteKit counterparts

cd /home/koom/repos/koo5/koordinator2000/0/koordinator2000/frontend/src/routes

# List of pages to convert
PAGES=("auth0" "about" "about2" "add_campaign" "causes" "load" "recover_password" "recovery_email_sent" "see_also" "settings" "users")

for page in "${PAGES[@]}"; do
  echo "Processing $page..."
  
  # Create directory if needed
  if [ \! -d "$page" ]; then
    mkdir -p "$page"
  fi
  
  # Create +page.js if it doesn't exist
  if [ \! -f "$page/+page.js" ]; then
    cat > "$page/+page.js" << 'ENDJS'
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return {};
}
ENDJS
    echo "  → Created $page/+page.js"
  fi
  
  # Copy old svelte file to new location if it doesn't exist
  if [ -f "$page.svelte" ] && [ \! -f "$page/+page.svelte" ]; then
    cp "$page.svelte" "$page/+page.svelte"
    echo "  → Copied $page.svelte to $page/+page.svelte"
  fi
done

# Special handling for dynamic route folders
DYNAMIC_ROUTES=("campaign/[slug]" "edit_cause/[slug]")

for route in "${DYNAMIC_ROUTES[@]}"; do
  dir=$(dirname "$route")
  slug=$(basename "$route")
  echo "Processing dynamic route $dir/$slug..."
  
  # Create directory if needed
  if [ \! -d "$dir/$slug" ]; then
    mkdir -p "$dir/$slug"
  fi
  
  # Create +page.js if it doesn't exist
  if [ \! -f "$dir/$slug/+page.js" ]; then
    cat > "$dir/$slug/+page.js" << 'ENDJS'
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return { slug: params.slug };
}
ENDJS
    echo "  → Created $dir/$slug/+page.js"
  fi
  
  # Copy old svelte file to new location if it doesn't exist
  if [ -f "$dir/$slug.svelte" ] && [ \! -f "$dir/$slug/+page.svelte" ]; then
    cp "$dir/$slug.svelte" "$dir/$slug/+page.svelte"
    echo "  → Copied $dir/$slug.svelte to $dir/$slug/+page.svelte"
  fi
done

echo "Page creation complete"
