/**
 * Build icons from SVG source
 * Note: This script verifies LOGO.svg exists and icons are generated.
 * For production builds, you need:
 * - build/icon.png (1024x1024) - for app window and macOS/Linux
 * - build/icon.ico (multi-size) - for Windows installer
 */
const fs = require('fs');
const path = require('path');

const sourceSvg = path.join(__dirname, '../LOGO.svg');
const buildDir = path.join(__dirname, '../build');
const targetPng = path.join(buildDir, 'icon.png');
const targetIco = path.join(buildDir, 'icon.ico');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Verify LOGO.svg exists
if (!fs.existsSync(sourceSvg)) {
  console.error('❌ LOGO.svg not found in project root!');
  process.exit(1);
}

console.log('✓ LOGO.svg found');

// Check if PNG icon exists
if (!fs.existsSync(targetPng)) {
  console.warn('⚠️  WARNING: build/icon.png not found!');
  console.warn('Using default electron icon for now.');
  console.warn('To use a custom icon, create build/icon.png (1024x1024)\n');
  // Don't exit, allow build to continue
} else {
  console.log('✓ build/icon.png found');
}

// Check if ICO icon exists (required for Windows NSIS installer)
if (!fs.existsSync(targetIco)) {
  console.warn('⚠️  WARNING: build/icon.ico not found!');
  console.warn('Windows installer will use default icon.');
  console.warn('To use a custom icon, create build/icon.ico\n');
  // Don't exit, allow build to continue
} else {
  console.log('✓ build/icon.ico found');
}

