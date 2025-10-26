# Convert SVG to PNG and ICO using Windows
# This script attempts to convert LOGO.svg to build/icon.png and build/icon.ico

$ErrorActionPreference = "Stop"

$svgPath = Join-Path $PSScriptRoot "..\LOGO.svg"
$buildDir = Join-Path $PSScriptRoot "..\build"
$pngPath = Join-Path $buildDir "icon.png"
$icoPath = Join-Path $buildDir "icon.ico"

Write-Host "Converting LOGO.svg to PNG and ICO..." -ForegroundColor Cyan

# Ensure build directory exists
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

# Check if SVG exists
if (-not (Test-Path $svgPath)) {
    Write-Host "ERROR: LOGO.svg not found!" -ForegroundColor Red
    exit 1
}

# Try to use Inkscape if installed
$inkscape = Get-Command inkscape -ErrorAction SilentlyContinue
if ($inkscape) {
    Write-Host "Using Inkscape to convert..." -ForegroundColor Green
    & inkscape $svgPath -w 1024 -h 1024 -o $pngPath 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PNG conversion successful!" -ForegroundColor Green
    }
}

# Try ImageMagick
$magick = Get-Command magick -ErrorAction SilentlyContinue
if ($magick) {
    if (-not (Test-Path $pngPath)) {
        Write-Host "Using ImageMagick to convert to PNG..." -ForegroundColor Green
        & magick $svgPath -background none -resize 1024x1024 $pngPath 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ PNG conversion successful!" -ForegroundColor Green
        }
    }
    
    # Convert PNG to ICO with multiple sizes
    if (Test-Path $pngPath) {
        Write-Host "Converting PNG to ICO..." -ForegroundColor Green
        $output = & magick $pngPath -define icon:auto-resize=256,128,96,64,48,32,16 $icoPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ ICO conversion successful!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "Warning: ICO conversion failed, trying alternative method..." -ForegroundColor Yellow
            # Try simpler conversion
            $output = & magick $pngPath -resize 256x256 $icoPath 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ ICO conversion successful (256x256)!" -ForegroundColor Green
                exit 0
            }
        }
    }
}

# If PNG exists but ICO failed, provide instructions
if ((Test-Path $pngPath) -and -not (Test-Path $icoPath)) {
    Write-Host "`n⚠ PNG created but ICO conversion failed." -ForegroundColor Yellow
    Write-Host "`nPlease convert icon.png to icon.ico manually:" -ForegroundColor White
    Write-Host "  1. Visit https://convertio.co/png-ico/" -ForegroundColor Cyan
    Write-Host "  2. Upload build/icon.png" -ForegroundColor Cyan
    Write-Host "  3. Download and save as build/icon.ico" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# If no tools available, provide instructions
if (-not (Test-Path $pngPath)) {
    Write-Host "`nNo SVG conversion tools found on your system." -ForegroundColor Yellow
    Write-Host "`nPlease convert LOGO.svg manually:" -ForegroundColor White
    Write-Host "  1. Visit https://svgtopng.com/" -ForegroundColor Cyan
    Write-Host "  2. Upload LOGO.svg" -ForegroundColor Cyan
    Write-Host "  3. Set size to 1024x1024" -ForegroundColor Cyan
    Write-Host "  4. Download and save as build/icon.png" -ForegroundColor Cyan
    Write-Host "`nThen convert to ICO:" -ForegroundColor White
    Write-Host "  1. Visit https://convertio.co/png-ico/" -ForegroundColor Cyan
    Write-Host "  2. Upload build/icon.png" -ForegroundColor Cyan
    Write-Host "  3. Download and save as build/icon.ico" -ForegroundColor Cyan
    Write-Host "`nOr install one of these tools:" -ForegroundColor White
    Write-Host "  - Inkscape: https://inkscape.org/release/" -ForegroundColor Cyan
    Write-Host "  - ImageMagick: https://imagemagick.org/script/download.php" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

exit 0
