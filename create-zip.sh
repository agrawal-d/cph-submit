#!/bin/bash
echo "Creating extension.zip"

# Build
echo "Executing npm webpack script"
npm run webpack

# Chrome
rm -rf chrome
mkdir chrome
jq -s 'reduce .[] as $item ({}; . * $item)' manifest.partial.json manifest-chrome.partial.json > manifest.json
zip -r chrome/extension.zip dist manifest.json icon-48.png
unzip chrome/extension.zip -d chrome/unpacked

# Firefox
rm -rf firefox
mkdir firefox
jq -s 'reduce .[] as $item ({}; . * $item)' manifest.partial.json manifest-firefox.partial.json > manifest.json
zip -r firefox/extension.zip dist manifest.json icon-48.png
unzip firefox/extension.zip -d firefox/unpacked

rm -f manifest.json

# Source code
echo "Creating source-code.zip"
rm -fv source-code.zip
zip -r source-code.zip ./ -x "node_modules/*" "dist/*" *.zip ".git/*" "web-ext-artifacts/*"

echo "Done."
