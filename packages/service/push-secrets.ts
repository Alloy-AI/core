#!/usr/bin/env bun

import { env } from './env';

// List of environment variables that are secrets
const secrets = [
  'GROQ_API_KEY',
  'PG_URI',
  'EVM_PRIVATE_KEY_SYNAPSE',
  'GEMINI_API_KEY',
  'ALCHEMY_API_KEY',
  'EVM_MCP_SERVER_URL'
] as const;

async function pushSecrets() {
  for (const key of secrets) {
    const value = env[key as keyof typeof env];
    if (value) {
      console.log(`Setting secret for ${key}`);
      try {
        await Bun.$`echo -n ${value} | oasis rofl secret set ${key} -`;
        console.log(`Successfully set ${key}`);
      } catch (error) {
        console.error(`Failed to set ${key}:`, error);
      }
    } else {
      console.warn(`Warning: ${key} is not set or empty`);
    }
  }
  console.log('All secrets pushed to Oasis ROFL.');
}

pushSecrets().catch(console.error);