#!/usr/bin/env fish

nvm use

prettier --config prettier.json --plugin prettier-plugin-svelte --write "webapp/src/**/*.{js,ts,css,html,svelte}"

