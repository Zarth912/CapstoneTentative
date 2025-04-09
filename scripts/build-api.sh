#!/bin/bash

set -e

# check code
# pnpm typecheck
# pnpm lint
# pnpm formatcheck

rm -rf .sst
rm -rf ./packages/api/dist
pnpm build:validators
pnpm sst build --stage dev
tsc --project ./packages/api/tsconfig.json
