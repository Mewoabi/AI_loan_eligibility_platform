# Local dev: generate Prisma client (requires venv\Scripts on PATH on Windows) then start API.
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$venvScripts = Join-Path $Root "venv\Scripts"
if (-not (Test-Path (Join-Path $venvScripts "python.exe"))) {
    Write-Error "Virtual env not found. Create it and run: pip install -r requirements.txt"
}
$env:PATH = "$venvScripts;$env:PATH"
& (Join-Path $venvScripts "python.exe") -m prisma generate
& (Join-Path $venvScripts "uvicorn.exe") main:app --reload @args
