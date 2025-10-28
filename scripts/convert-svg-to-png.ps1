$ErrorActionPreference = 'SilentlyContinue'

# Check if ImageMagick is installed
$magickPath = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magickPath) {
    Write-Host "⚠️  ImageMagick not found. Skipping icon conversion." -ForegroundColor Yellow
    Write-Host "Install ImageMagick to enable automatic icon generation." -ForegroundColor Yellow
    exit 0
}

# Paths
$rootDir = Split-Path -Parent $PSScriptRoot
$sourceSvg = Join-Path $rootDir "LOGO.svg"
$buildDir = Join-Path $rootDir "build"
$pngIcon = Join-Path $buildDir "icon.png"
$icoIcon = Join-Path $buildDir "icon.ico"

# Create build directory if it doesn't exist
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

# Check if LOGO.svg exists
if (-not (Test-Path $sourceSvg)) {
    Write-Host "❌ LOGO.svg not found in project root!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Converting LOGO.svg to PNG (1024x1024)..." -ForegroundColor Green

# Convert SVG to PNG (1024x1024 for high quality)
& magick convert -background none -density 300 -resize 1024x1024 "$sourceSvg" "$pngIcon" 2>$null

if (Test-Path $pngIcon) {
    Write-Host "✓ icon.png created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Failed to create icon.png" -ForegroundColor Yellow
}

Write-Host "✓ Converting PNG to ICO (multi-size)..." -ForegroundColor Green

# Convert PNG to ICO with multiple sizes (16,32,48,64,128,256)
& magick convert "$pngIcon" -define icon:auto-resize=256,128,64,48,32,16 "$icoIcon" 2>$null

if (Test-Path $icoIcon) {
    Write-Host "✓ icon.ico created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Failed to create icon.ico" -ForegroundColor Yellow
}

Write-Host "`n✓ Icon conversion complete!" -ForegroundColor Cyan