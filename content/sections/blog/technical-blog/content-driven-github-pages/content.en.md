## The key limitation

A browser cannot safely enumerate arbitrary folders on a static server. Therefore, this repository uses a small build script.

Whenever you push a change, GitHub Actions:

1. Scans every section, category and item folder
2. Detects `cover.*`, gallery images, local videos and code files
3. Reads multilingual Markdown and external links
4. Produces a single generated content index
5. Deploys the finished `_site` folder

The page code never needs to know how many projects or artworks exist.