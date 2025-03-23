#\!/bin/bash

# Script to fix all page files

cd /home/koom/repos/koo5/koordinator2000/0/koordinator2000/frontend/src/routes

# Find all +page.svelte files
for file in $(find . -name "+page.svelte"); do
  echo "Processing $file"
  
  # Remove script context=module blocks
  sed -i '/<script context="module">/,/<\/script>/d' "$file"
  
  # Convert 'src/' imports to relative imports
  # Get the directory depth
  depth=$(echo $(dirname "$file") | tr -cd '/' | wc -c)
  prefix=""
  for ((i=0; i<depth; i++)); do
    prefix="../$prefix"
  done
  
  # Replace imports
  sed -i "s|from 'src/|from '$prefix|g" "$file"
  sed -i "s|import .* from '@sapper/app'|import { goto } from '\$app/navigation'|g" "$file"
  
  # Fix any type='js' to just type
  sed -i "s|<script type='js'>|<script>|g" "$file"
  
  echo "  → Updated $file"
done

# Remove all old-format files that have been migrated
echo "Removing old files..."
for dir in */; do
  base=$(basename "$dir")
  if [ -f "$base.svelte" ] && [ -f "$dir+page.svelte" ]; then
    echo "  → Removing $base.svelte (migrated to $dir+page.svelte)"
    rm "$base.svelte"
  fi
done

echo "Fix complete"
