#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build complete!"
ls -la dist/
