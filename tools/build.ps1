param([string]$Version = (Get-Date -Format 'yyyyMMdd-HHmm'))

# 將遊戲封裝成 zip 放進 builds/(此資料夾已被 .gitignore 排除,不進版本控制)
# 用法: powershell -File tools\build.ps1 -Version 0.1.0
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "builds\TopRace_v$Version.zip"
$items = @('index.html', 'css', 'js', 'assets') | ForEach-Object { Join-Path $root $_ } | Where-Object { Test-Path $_ }
if (Test-Path $out) { Remove-Item $out }
Compress-Archive -Path $items -DestinationPath $out
Write-Host "Built: $out"
