# reset-sonarqube.ps1
# Starts Docker Desktop, deletes the old SonarQube container, and starts a fresh one.

$DockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
$ContainerName = "sonarqube"
$SonarUrl = "http://localhost:9000"

Write-Host "=== Resetting SonarQube and Credentials ===" -ForegroundColor Cyan

# 1. Check/Start Docker daemon
Write-Host "Checking Docker daemon..."
& docker ps >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Starting Docker Desktop..." -ForegroundColor Yellow
    if (Test-Path $DockerPath) {
        Start-Process $DockerPath
        $dockReady = $false
        for ($i = 0; $i -lt 24; $i++) {
            Start-Sleep -Seconds 5
            & docker ps >$null 2>&1
            if ($LASTEXITCODE -eq 0) {
                $dockReady = $true
                break
            }
            Write-Host "  Waiting for Docker daemon... ($($i * 5)s)"
        }
        if (-not $dockReady) {
            Write-Error "Docker daemon failed to start. Please open Docker Desktop manually."
            exit 1
        }
    } else {
        Write-Error "Docker Desktop not found at $DockerPath."
        exit 1
    }
} else {
    Write-Host "Docker daemon is running." -ForegroundColor Green
}

# 2. Delete existing container
Write-Host "Removing existing SonarQube container (if any)..." -ForegroundColor Yellow
docker rm -f $ContainerName >$null 2>&1

# 3. Start brand new container
Write-Host "Starting a fresh SonarQube container..." -ForegroundColor Yellow
docker run -d --name $ContainerName -p 9000:9000 -p 9092:9092 sonarqube:community
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start fresh container."
    exit 1
}

# 4. Wait for web server to start up
Write-Host "Waiting for web server to start at $SonarUrl (this can take 1-2 minutes)..." -ForegroundColor Yellow
$webReady = $false
for ($i = 1; $i -le 36; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $SonarUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $webReady = $true
            break
        }
    } catch {}
    Write-Host "  Waiting for web server... ($($i * 5)s)"
    Start-Sleep -Seconds 5
}

if ($webReady) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "SonarQube has been reset successfully!" -ForegroundColor Green
    Write-Host "Access URL: $SonarUrl" -ForegroundColor Green
    Write-Host "Default credentials: admin / admin" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Warning "SonarQube server is taking longer than expected to start."
}
