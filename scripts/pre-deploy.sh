#!/bin/bash

set -e

# check code
pnpm typecheck
pnpm lint
pnpm formatcheck

pnpm build:validators
