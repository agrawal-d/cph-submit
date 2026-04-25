#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to run shell commands and log output
const run = (cmd) => {
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to execute: ${cmd}`);
        process.exit(1);
    }
};

// Helper to clean and create directories
const resetDir = (dir) => {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
};

console.log('Creating extension packages...');

// 1. Build project
console.log('Executing npm webpack script...');
run('npm run webpack');

const targets = [
    { name: 'chrome', partial: 'manifest-chrome.partial.json' },
    { name: 'firefox', partial: 'manifest-firefox.partial.json' },
];

targets.forEach((target) => {
    console.log(`Processing ${target.name}...`);
    resetDir(target.name);

    // Merge manifests using jq
    run(
        `jq -s "reduce .[] as $item ({}; . * $item)" manifest.partial.json ${target.partial} > manifest.json`,
    );

    // Create zip (using 'tar' which is cross-platform in modern OSs for zip files)
    // -a auto-selects compression based on extension (.zip)
    const zipPath = path.join(target.name, 'extension.zip');
    run(`tar -a -cf ${zipPath} dist manifest.json icon-48.png`);

    // Unpack for preview
    const unpackPath = path.join(target.name, 'unpacked');
    fs.mkdirSync(unpackPath, { recursive: true });
    run(`tar -xf ${zipPath} -C ${unpackPath}`);
});

// Cleanup temp manifest
if (fs.existsSync('manifest.json')) fs.unlinkSync('manifest.json');

// 2. Create Source Code Zip
console.log('Creating source-code.zip...');
if (fs.existsSync('source-code.zip')) fs.unlinkSync('source-code.zip');

// On Windows/Unix, we exclude patterns. Note: 'tar' exclusion syntax can be picky,
// so we use a simple approach.
run(
    'tar --exclude="node_modules" --exclude="dist" --exclude="*.zip" --exclude=".git" --exclude="web-ext-artifacts" -a -cf source-code.zip .',
);

console.log('Done.');
