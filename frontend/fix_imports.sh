#\!/bin/bash

# Script to fix imports in SvelteKit files

cd /home/koom/repos/koo5/koordinator2000/0/koordinator2000/frontend/src/routes

# Process each .svelte file in subdirectories that contains src/ imports
for file in $(find . -name "+page.svelte" -o -name "+page.js"); do
  echo "Processing $file"
  
  # Get the directory depth to calculate the correct relative path
  dirpath=$(dirname "$file")
  depth=$(echo "$dirpath" | tr -cd '/' | wc -c)
  relativepath=""
  
  # Build the relative path based on directory depth
  for ((i=0; i<depth; i++)); do
    relativepath="../$relativepath"
  done
  
  # Replace 'src/' with the correct relative path
  sed -i "s|'src/|'$relativepath|g" "$file"
  
  # Replace import from @sapper/app with SvelteKit equivalent
  sed -i "s|from '@sapper/app'|from '\$app/navigation'|g" "$file"
  sed -i "s|from '@sapper/app'|from '\$app/stores'|g" "$file"
  
  # Replace process.browser with browser
  sed -i "s|process\.browser|browser|g" "$file"
  
  echo "  → Updated imports in $file"
done

echo "Import fixes complete"
