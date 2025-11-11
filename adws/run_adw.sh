#!/bin/bash

# ADW Environment Setup and Execution Script

# GitHub Configuration
export GITHUB_REPO_URL="https://github.com/NithishTU/TAC-5-6"

# Claude Code Path - use full path on Windows
export CLAUDE_CODE_PATH="C:/Users/Nithish/AppData/Roaming/npm/claude.cmd"

# Remove invalid GITHUB_PAT from environment (use gh auth instead)
export GITHUB_PAT=""

# Run ADW SDLC with provided issue number
if [ -z "$1" ]; then
    echo "Usage: ./run_adw.sh <issue-number> [adw-id]"
    exit 1
fi

echo "Starting ADW SDLC for issue #$1..."
uv run adw_sdlc.py "$@"
