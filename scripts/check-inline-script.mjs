import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .join('\n');

new Function(scripts);
console.log('inline script syntax ok');
