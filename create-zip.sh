#!/bin/bash
echo "Creating extension.zip"
rm -fv extension.zip
zip -r extension.zip dist manifest.json icon-48.png
echo "Creating source-code.zip"
rm -fv source-code.zip
zip -r source-code.zip ./ -x "node_modules/*" "dist/*" *.zip ".git/*" "web-ext-artifacts/*"
echo "Done."
