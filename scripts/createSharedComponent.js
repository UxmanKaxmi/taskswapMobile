#!/usr/bin/env node

/* eslint-env node */
import fs from 'fs';
import path from 'path';
import process from 'process';

const componentName = process.argv[2];

if (!componentName) {
  console.error('❌ Please provide a component name');
  console.log('👉 Usage: yarn create-sharedComponent Button');
  process.exit(1);
}

// Enforce PascalCase (optional but recommended)
if (!/^[A-Z][A-Za-z0-9]+$/.test(componentName)) {
  console.error('❌ Component name must be PascalCase (e.g. AppLogo)');
  process.exit(1);
}

const basePath = path.join(
  process.cwd(),
  'src',
  'shared',
  'components',
  componentName
);

if (fs.existsSync(basePath)) {
  console.error(`❌ Component "${componentName}" already exists`);
  process.exit(1);
}

fs.mkdirSync(basePath, { recursive: true });

const componentFile = `
import React from 'react';

export const ${componentName} = () => {
  return null;
};

export default ${componentName};
`.trim();

const indexFile = `
export { default } from './${componentName}';
export * from './${componentName}';
`.trim();

fs.writeFileSync(
  path.join(basePath, `${componentName}.tsx`),
  componentFile,
  'utf8'
);

fs.writeFileSync(
  path.join(basePath, 'index.ts'),
  indexFile,
  'utf8'
);

console.log(`✅ Shared component "${componentName}" created at ${basePath}`);