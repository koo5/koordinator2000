#!/bin/bash

# JS to TS Converter Script
# This script helps automate the conversion of JavaScript files to TypeScript

# Check if a file was provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 path/to/file.js"
    exit 1
fi

JS_FILE=$1

# Check if the file exists
if [ ! -f "$JS_FILE" ]; then
    echo "Error: File $JS_FILE does not exist."
    exit 1
fi

# Check if the file is a JS file
if [[ ! "$JS_FILE" =~ \.js$ ]]; then
    echo "Error: File must be a JavaScript file (.js extension)."
    exit 1
fi

# Create the TypeScript file name
TS_FILE="${JS_FILE%.*}.ts"

# Check if TS file already exists
if [ -f "$TS_FILE" ]; then
    read -p "TypeScript file $TS_FILE already exists. Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 1
    fi
fi

# Copy the JS file to TS file
cp "$JS_FILE" "$TS_FILE"

echo "🔄 Converting $JS_FILE to TypeScript..."

# Basic conversions
# 1. Replace 'var' with 'let'
sed -i 's/\bvar\b/let/g' "$TS_FILE"

# 2. Add basic JSDoc comments for functions
sed -i '/function [a-zA-Z0-9_]*(/s/^/\/\*\* \n \* Function description \n \*\/\n/' "$TS_FILE"

# 3. Add empty type annotations to function parameters
sed -i 's/function \([a-zA-Z0-9_]*\)(\([^)]*\))/function \1(\2: any)/' "$TS_FILE"

# 4. Fix import paths (remove .js extensions)
sed -i "s/from '\(\..*\)\.js'/from '\1'/g" "$TS_FILE"
sed -i 's/from "\(\..*\)\.js"/from "\1"/g' "$TS_FILE"

echo "✅ Basic conversion complete. The file has been converted to $TS_FILE"
echo "⚠️ Please review the file for any issues and add proper type annotations."

# List some common TypeScript annotations for reference
echo ""
echo "📝 Common TypeScript annotations:"
echo "- Basic types: string, number, boolean, any, unknown"
echo "- Arrays: string[], number[], Array<string>"
echo "- Objects: { property: string, optional?: number }"
echo "- Functions: (param: string) => void, () => Promise<number>"
echo "- Type definitions:"
echo "  interface User { id: number; name: string; }"
echo "  type Status = 'active' | 'inactive' | 'pending';"
echo ""

# Ask if we should open the file in an editor
if command -v code &> /dev/null; then
    read -p "Open in VSCode? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        code "$TS_FILE"
    fi
elif command -v vim &> /dev/null; then
    read -p "Open in Vim? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vim "$TS_FILE"
    fi
fi

echo "Done! 🎉"