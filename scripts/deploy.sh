#!/usr/bin/env bash
set -e

npm run build

REMOTE=$(git remote get-url origin)

cd build
git init
git checkout -B gh-pages
git add -A
git commit -m "Deploy to GitHub Pages"
git push "$REMOTE" gh-pages --force

echo -e "\nDeployed to gh-pages branch."
