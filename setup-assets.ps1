# Ramadan Prep - Assets Setup Script
$root = "C:\Users\baych\OneDrive\Desktop\cf"
$public = "$root\public"

# 1. Create directories
if (!(Test-Path "$public\fonts")) { New-Item -ItemType Directory -Path "$public\fonts" }
if (!(Test-Path "$public\images")) { New-Item -ItemType Directory -Path "$public\images" }

# 2. Copy Fonts
$fontsSource = "$root\fonts.gstatic.com\s"
Copy-Item "$fontsSource\amiri\v30\J7acnpd8CGxBHp2VkaY6zp5yGw.woff2" "$public\fonts\" -ErrorAction SilentlyContinue
Copy-Item "$fontsSource\amiri\v30\J7acnpd8CGxBHp2VkaY_zp4.woff2" "$public\fonts\" -ErrorAction SilentlyContinue
Copy-Item "$fontsSource\cairo\v31\SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2" "$public\fonts\" -ErrorAction SilentlyContinue
Copy-Item "$fontsSource\cairo\v31\SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2" "$public\fonts\" -ErrorAction SilentlyContinue

# 3. Copy Images
$imagesSource = "$root\i3igcw.vercel.app\images"
Copy-Item "$imagesSource\ramadan-banner.png" "$public\images\" -ErrorAction SilentlyContinue
Copy-Item "$imagesSource\ramadan-icon.png" "$public\images\" -ErrorAction SilentlyContinue

Write-Host "Done! Assets moved to public folder." -ForegroundColor Green
Write-Host "Please refresh your browser."
