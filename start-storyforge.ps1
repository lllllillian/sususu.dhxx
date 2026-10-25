$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$vite = Join-Path $project "node_modules\.bin\vite.cmd"
$log = Join-Path $project ".vite-server.log"
$apiLog = Join-Path $project ".api-server.log"
$apiErrorLog = Join-Path $project ".api-server-error.log"
$node = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not (Test-Path -LiteralPath $vite)) {
    "Vite is missing. Install project dependencies first." | Set-Content -LiteralPath $log
    exit 1
}

if (-not $node) {
    "Node.js is missing. Install Node.js first." | Set-Content -LiteralPath $apiLog
    exit 1
}

Set-Location -LiteralPath $project
if (-not (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $node -ArgumentList "--env-file=.env", "server/index.mjs" -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput $apiLog -RedirectStandardError $apiErrorLog
    Start-Sleep -Seconds 1
}

if (-not (Get-NetTCPConnection -LocalPort 5174 -State Listen -ErrorAction SilentlyContinue)) {
    & $vite --host 0.0.0.0 --port 5174 --strictPort *> $log
}
