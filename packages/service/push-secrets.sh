#!/bin/bash

vars=("GROQ_API_KEY" "PG_URI" "EVM_PRIVATE_KEY_SYNAPSE" "GEMINI_API_KEY" "ALCHEMY_API_KEY" "EVM_MCP_SERVER_URL")

for var in "${vars[@]}"; do
  value=$(printenv "$var")
  if [ -n "$value" ]; then
    echo "Setting secret for $var"
    echo -n "$value" | oasis rofl secret set "$var" -
  else
    echo "Warning: $var is not set or empty"
  fi
done

echo "All secrets pushed to Oasis ROFL."
