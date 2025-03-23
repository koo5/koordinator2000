#\!/bin/bash

# Script to migrate Sapper page files to SvelteKit format
# This migrates root-level .svelte files to +page.svelte files in their own directories

cd /home/koom/repos/koo5/koordinator2000/0/koordinator2000/frontend/src/routes

# Process each .svelte file (excluding those already in the new format)
for file in $(find . -maxdepth 1 -name "*.svelte" \! -name "_*.svelte" \! -name "+*.svelte"); do
  echo "Processing $file"
  
  # Get the file name without extension
  filename=$(basename "$file" .svelte)
  
  # Create a directory for the page if it doesn't exist
  if [ \! -d "$filename" ]; then
    mkdir -p "$filename"
  fi
  
  # Check if the destination file already exists
  if [ \! -f "$filename/+page.svelte" ]; then
    # Move and rename the file
    cp "$file" "$filename/+page.svelte"
    echo "  → Created $filename/+page.svelte"
  else
    echo "  → $filename/+page.svelte already exists, skipping"
  fi
done

echo "Migration complete"
