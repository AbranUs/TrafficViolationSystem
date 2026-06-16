# start-sonarqube.ps1
# Automates launching Docker Desktop and the SonarQube container.

$DockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
$ContainerName = "sonarqube"
$SonarUrl = "http://localhost:9000"

Write-Host "=== Starting SonarQube Setup Script ===" -ForegroundColor Cyan

# 1. Check if Docker daemon is running
Write-Host "Checking if Docker daemon is running..."
& docker ps >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker daemon is not running. Attempting to start Docker Desktop..." -ForegroundColor Yellow
    if (Test-Path $DockerPath) {
        Start-Process $DockerPath
        Write-Host "Docker Desktop started. Waiting for daemon to be ready (this may take up to 2 minutes)..." -ForegroundColor Yellow
        
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
            Write-Error "Docker daemon failed to start within 2 minutes. Please open Docker Desktop manually and run this script again."
            exit 1
        }
        Write-Host "Docker daemon is ready!" -ForegroundColor Green
    } else {
        Write-Error "Docker Desktop was not found at $DockerPath. Please install Docker or start it manually."
        exit 1
    }
} else {
    Write-Host "Docker daemon is already running." -ForegroundColor Green
}

# 2. Check if SonarQube container exists
Write-Host "Checking for SonarQube container..."
$containerExists = & docker ps -a --filter "name=^/$ContainerName$" --format "{{.Names}}"
if ($containerExists -eq $ContainerName) {
    Write-Host "Found existing container: $ContainerName" -ForegroundColor Cyan
    $status = & docker inspect -f '{{.State.Running}}' $ContainerName
    if ($status -eq "true") {
        Write-Host "SonarQube container is already running." -ForegroundColor Green
    } else {
        Write-Host "Starting stopped SonarQube container..." -ForegroundColor Yellow
        docker start $ContainerName
    }
} else {
    Write-Host "SonarQube container not found. Pulling image and creating new container..." -ForegroundColor Yellow
    # Create the container. We use community edition.
    docker run -d --name $ContainerName -p 9000:9000 -p 9092:9092 sonarqube:community
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to run SonarQube docker container."
        exit 1
    }
    Write-Host "SonarQube container created and started successfully." -ForegroundColor Green
}

# 3. Wait for SonarQube web service to start up
Write-Host "Waiting for SonarQube web server to start up at $SonarUrl (this can take 1-2 minutes)..." -ForegroundColor Yellow
$webReady = $false
# SonarQube takes a bit of time to initialize search indexes and database connections on startup.
for ($i = 1; $i -le 36; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $SonarUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $webReady = $true
            break
        }
    } catch {
        # Web server not ready yet
    }
    Write-Host "  Waiting for web server... ($($i * 5)s)"
    Start-Sleep -Seconds 5
}

if ($webReady) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "SonarQube is now up and running!" -ForegroundColor Green
    Write-Host "Access URL: $SonarUrl" -ForegroundColor Green
    Write-Host "Default credentials: admin / admin (you will be prompted to change it)" -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Warning "SonarQube server is taking longer than expected to start."
    Write-Warning "Please check the logs using: docker logs -f $ContainerName"
    Write-Warning "Once started, visit: $SonarUrl"
}
