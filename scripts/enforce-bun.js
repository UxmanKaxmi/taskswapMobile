#!/usr/bin/env node

const userAgent = process.env.npm_config_user_agent || '';
const isBun = /\bbun\//.test(userAgent);

if (!isBun) {
  console.error('This repository is Bun-only. Use `bun install`.');
  process.exit(1);
}
