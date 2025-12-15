#!/bin/bash

# Local CI script - runs all checks before pushing

set -e

echo "========================================="
echo "Running Local CI Pipeline"
echo "========================================="

echo ""
echo "Step 1/4: Linting..."
pnpm lint

echo ""
echo "Step 2/4: Type Checking..."
pnpm type-check

echo ""
echo "Step 3/4: Running Tests..."
pnpm test

echo ""
echo "Step 4/4: Build Check..."
pnpm prisma generate
pnpm next build

echo ""
echo "========================================="
echo "All checks passed!"
echo "========================================="
