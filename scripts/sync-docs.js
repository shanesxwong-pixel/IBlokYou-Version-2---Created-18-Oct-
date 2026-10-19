import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist! Run "vite build" first.');
  process.exit(1);
}

// Ensure docs folder exists
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Copy dist contents to docs
copyRecursiveSync(distDir, docsDir);

// Create docs/.nojekyll to disable Jekyll processing on GitHub Pages
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf-8');

// Also create root .nojekyll
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '', 'utf-8');

// Copy index.html as 404.html in docs for GitHub Pages SPA fallback
if (fs.existsSync(path.join(docsDir, 'index.html'))) {
  fs.copyFileSync(path.join(docsDir, 'index.html'), path.join(docsDir, '404.html'));
}

console.log('Successfully synchronized dist to docs/ with .nojekyll and 404.html for GitHub Pages.');
