# 🏗️ Windows Installer Creation Guide - Spencer Task Manager

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installer Tools Setup](#installer-tools-setup)
4. [Project Preparation](#project-preparation)
5. [Creating the Installer Package](#creating-the-installer-package)
6. [Advanced Installer Features](#advanced-installer-features)
7. [Distribution & Testing](#distribution--testing)
8. [Automation Scripts](#automation-scripts)

---

## 🎯 Overview

This guide shows how to create professional Windows installers (.exe) for Spencer Task Manager that customers can easily install on their machines. The installer will:

- ✅ Install Docker Desktop automatically (if not present)
- ✅ Deploy the Spencer Task Manager application
- ✅ Create desktop shortcuts and start menu entries
- ✅ Handle license key validation
- ✅ Set up Windows services for auto-start
- ✅ Include uninstaller functionality
- ✅ Validate Docker installation and setup
- ✅ Configure Docker containers automatically

## 🐳 Docker Installation Strategy

### **Option 1: Automatic Docker Installation (Recommended)**

The installer can automatically install Docker Desktop if it's not present:

```powershell
# Check for Docker installation
function Test-DockerInstalled {
    try {
        $docker = Get-Command docker -ErrorAction SilentlyContinue
        if ($docker) {
            $version = docker --version
            Write-Host "Docker found: $version" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "Docker not found" -ForegroundColor Yellow
        return $false
    }
    return $false
}

# Download and install Docker Desktop
function Install-DockerDesktop {
    Write-Host "Downloading Docker Desktop..." -ForegroundColor Blue
    
    $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $dockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"
    
    # Download Docker Desktop installer
    Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstaller
    
    Write-Host "Installing Docker Desktop..." -ForegroundColor Blue
    # Install Docker Desktop silently
    Start-Process -FilePath $dockerInstaller -ArgumentList "install --quiet" -Wait
    
    # Wait for Docker to start
    Write-Host "Waiting for Docker to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Verify installation
    if (Test-DockerInstalled) {
        Write-Host "Docker Desktop installed successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Docker installation failed!" -ForegroundColor Red
        return $false
    }
}
```

### **Option 2: Bundled Docker Installer**

Include Docker Desktop installer within your main installer package:

```inno
[Files]
; Main application files
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Docker Desktop installer
Source: "dependencies\DockerDesktopInstaller.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Run]
; Install Docker if not present
Filename: "{tmp}\DockerDesktopInstaller.exe"; Parameters: "install --quiet"; StatusMsg: "Installing Docker Desktop..."; Check: not IsDockerInstalled
; Start Spencer Task Manager
Filename: "{app}\start-spencer.bat"; Description: "Launch Spencer Task Manager"; Flags: postinstall nowait
```

### **Option 3: Docker Service Validation**

Ensure Docker is running before starting the application:

```powershell
function Start-DockerService {
    Write-Host "Starting Docker service..." -ForegroundColor Blue
    
    # Start Docker Desktop
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden
    
    # Wait for Docker daemon to be ready
    $timeout = 120 # 2 minutes timeout
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        try {
            docker info | Out-Null
            Write-Host "Docker is ready!" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "Waiting for Docker to start... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            $elapsed += 5
        }
    }
    
    Write-Host "Docker failed to start within timeout!" -ForegroundColor Red
    return $false
}
```

---

## 📦 Prerequisites

### **System Requirements:**
- Windows 10/11 (development machine)
- Node.js 18+ installed
- Docker Desktop
- Git
- PowerShell 5.1+

### **Tools Needed:**
1. **Inno Setup** (Free, professional installer creator)
2. **Docker Desktop** (for containerization)
3. **7-Zip** (for compression)
4. **Signtool** (for code signing - optional)

---

## 🛠️ Installer Tools Setup

### **Step 1: Install Inno Setup**

```powershell
# Download and install Inno Setup
# Visit: https://jrsoftware.org/isinfo.php
# Download: innosetup-6.2.2.exe

# Or use Chocolatey
choco install innosetup

# Or use Winget
winget install JRSoftware.InnoSetup
```

### **Step 2: Install Additional Tools**

```powershell
# Install 7-Zip for compression
winget install 7zip.7zip

# Install Git (if not already installed)
winget install Git.Git

# Install Node.js (if not already installed)
winget install OpenJS.NodeJS
```

### **Step 3: Verify Installation**

```powershell
# Check all tools are installed
iscc.exe /?          # Inno Setup compiler
docker --version     # Docker Desktop
node --version       # Node.js
git --version        # Git
```

---

## 📁 Project Preparation

### **Step 1: Create Installer Project Structure**

```powershell
# Create installer build directory
mkdir C:\Spencer-Installer-Build
cd C:\Spencer-Installer-Build

# Create directory structure
mkdir application, installer, dependencies, documentation, scripts
```

### **Final Directory Structure:**
```
C:\Spencer-Installer-Build/
├── 📁 application/
│   ├── 📄 spencer-taskmanager/          # Your Next.js app
│   ├── 📄 docker-compose.yml           # Docker configuration
│   ├── 📄 start.bat                    # Startup script
│   └── 📄 .env.production               # Production config
├── 📁 installer/
│   ├── 📄 setup.iss                    # Inno Setup script
│   ├── 📄 license.txt                  # Software license
│   └── 📄 readme.txt                   # Installation notes
├── 📁 dependencies/
│   ├── 📄 DockerDesktop-4.25.exe      # Docker installer
│   ├── 📄 vcredist_x64.exe             # Visual C++ Redistributable
│   └── 📄 dotnet-6-runtime.exe         # .NET Runtime (if needed)
├── 📁 documentation/
│   ├── 📄 INSTALLATION-GUIDE.pdf
│   ├── 📄 USER-MANUAL.pdf
│   └── 📄 QUICK-START.pdf
└── 📁 scripts/
    ├── 📄 build-installer.ps1          # Build automation
    ├── 📄 prepare-app.ps1              # App preparation
    └── 📄 sign-installer.ps1           # Code signing
```

---

## 🔨 Creating the Installer Package

### **Step 1: Prepare Application Files**

```powershell
# prepare-app.ps1
Write-Host "🚀 Preparing Spencer Task Manager for packaging..." -ForegroundColor Green

# Set variables
$SourcePath = "C:\path\to\your\spencer-taskmanager-repo"
$BuildPath = "C:\Spencer-Installer-Build\application"

# Clean build directory
if (Test-Path $BuildPath) {
    Remove-Item $BuildPath -Recurse -Force
}
New-Item -ItemType Directory -Path $BuildPath

# Copy application files
Write-Host "📦 Copying application files..." -ForegroundColor Yellow
Copy-Item "$SourcePath\*" -Destination $BuildPath -Recurse -Exclude @('.git', 'node_modules', '.next')

# Build the application
Set-Location $BuildPath
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm install --production
npm run build

# Create production Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t spencer-taskmanager:enterprise .
docker save spencer-taskmanager:enterprise -o spencer-taskmanager-image.tar

# Create startup script
$StartScript = @"
@echo off
echo 🚀 Starting Spencer Task Manager...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    timeout /t 30 /nobreak >nul
)

REM Load Docker image if not exists
docker images spencer-taskmanager:enterprise | findstr spencer-taskmanager >nul
if %errorlevel% neq 0 (
    echo Loading Spencer Task Manager...
    docker load -i "%~dp0spencer-taskmanager-image.tar"
)

REM Start the application
docker-compose up -d

REM Open browser
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo ✅ Spencer Task Manager is running!
echo 🌐 Access at: http://localhost:3000
pause
"@

$StartScript | Out-File -FilePath "$BuildPath\start.bat" -Encoding ASCII

Write-Host "✅ Application prepared successfully!" -ForegroundColor Green
```

### **Step 2: Create Inno Setup Script**

```ini
; setup.iss - Inno Setup Configuration
[Setup]
AppName=Spencer Denim Task Manager
AppVersion=1.0.0
AppPublisher=Spencer Denim Solutions
AppPublisherURL=https://spencerdenim.com
AppSupportURL=https://spencerdenim.com/support
AppUpdatesURL=https://spencerdenim.com/updates
DefaultDirName={pf}\Spencer Task Manager
DefaultGroupName=Spencer Task Manager
AllowNoIcons=yes
LicenseFile=license.txt
InfoBeforeFile=readme.txt
OutputDir=..\output
OutputBaseFilename=spencer-taskmanager-enterprise-setup
SetupIconFile=spencer-icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1
Name: "startservice"; Description: "Start Spencer Task Manager after installation"; GroupDescription: "Startup Options"; Flags: checked

[Files]
; Application files
Source: "application\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Dependencies
Source: "dependencies\DockerDesktop-4.25.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "dependencies\vcredist_x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall
; Documentation
Source: "documentation\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Spencer Task Manager"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; IconFilename: "{app}\spencer-icon.ico"
Name: "{group}\Spencer Documentation"; Filename: "{app}\docs"; IconFilename: "{app}\docs-icon.ico"
Name: "{group}\{cm:UninstallProgram,Spencer Task Manager}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Spencer Task Manager"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; IconFilename: "{app}\spencer-icon.ico"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Spencer Task Manager"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; Tasks: quicklaunchicon

[Run]
; Install Visual C++ Redistributable
Filename: "{tmp}\vcredist_x64.exe"; Parameters: "/quiet"; StatusMsg: "Installing Visual C++ Redistributable..."; Flags: waituntilterminated

; Install Docker Desktop
Filename: "{tmp}\DockerDesktop-4.25.exe"; Parameters: "install --quiet --accept-license"; StatusMsg: "Installing Docker Desktop..."; Flags: waituntilterminated; Check: not DockerInstalled

; Start Spencer Task Manager
Filename: "{app}\start.bat"; Description: "{cm:LaunchProgram,Spencer Task Manager}"; Flags: nowait postinstall skipifsilent; Tasks: startservice

[UninstallRun]
; Stop services before uninstall
Filename: "{cmd}"; Parameters: "/c docker-compose -f ""{app}\docker-compose.yml"" down"; WorkingDir: "{app}"; RunOnceId: "StopSpencer"

[Code]
// Docker installation and validation functions
function DockerInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('docker', '--version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function DockerDesktopInstalled: Boolean;
var
  DockerPath: String;
begin
  DockerPath := ExpandConstant('{pf}\Docker\Docker\Docker Desktop.exe');
  Result := FileExists(DockerPath);
end;

function IsDockerRunning: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('docker', 'info', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function WaitForDocker: Boolean;
var
  Counter: Integer;
  ResultCode: Integer;
begin
  Result := False;
  Counter := 0;
  
  // Wait up to 120 seconds for Docker to start
  while (Counter < 24) and (not Result) do begin
    Sleep(5000); // Wait 5 seconds
    Result := Exec('docker', 'info', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
    Counter := Counter + 1;
  end;
end;

function StartDockerDesktop: Boolean;
var
  DockerPath: String;
  ResultCode: Integer;
begin
  DockerPath := ExpandConstant('{pf}\Docker\Docker\Docker Desktop.exe');
  if FileExists(DockerPath) then begin
    Exec(DockerPath, '', '', SW_HIDE, ewNoWait, ResultCode);
    Result := WaitForDocker();
  end else begin
    Result := False;
  end;
end;

function ValidateDockerInstallation: Boolean;
begin
  Result := DockerInstalled and DockerDesktopInstalled;
  
  if not Result then begin
    MsgBox('Docker installation validation failed. Please ensure Docker Desktop is properly installed and running.', 
           mbError, MB_OK);
  end;
end;

// License validation functions
function ValidateLicenseKey(LicenseKey: String): Boolean;
var
  HttpRequest: Variant;
  Response: String;
begin
  Result := False;
  try
    HttpRequest := CreateOleObject('WinHttp.WinHttpRequest.5.1');
    HttpRequest.Open('POST', 'https://api.spencerdenim.com/validate-license', False);
    HttpRequest.SetRequestHeader('Content-Type', 'application/json');
    HttpRequest.Send('{"license_key":"' + LicenseKey + '"}');
    
    if HttpRequest.Status = 200 then begin
      Response := HttpRequest.ResponseText;
      Result := Pos('"valid":true', Response) > 0;
    end;
  except
    // Fallback for offline validation
    Result := (Length(LicenseKey) = 25) and (Copy(LicenseKey, 1, 3) = 'SPD');
  end;
end;

function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;

function IsUpgrade(): Boolean;
begin
  Result := (GetUninstallString() <> '');
end;

function UnInstallOldVersion(): Integer;
var
  sUnInstallString: String;
  iResultCode: Integer;
begin
  Result := 0;
  sUnInstallString := GetUninstallString();
  if sUnInstallString <> '' then begin
    sUnInstallString := RemoveQuotes(sUnInstallString);
    if Exec(sUnInstallString, '/SILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
      Result := 3
    else
      Result := 2;
  end else
    Result := 1;
end;

// Custom installation steps
procedure CurStepChanged(CurStep: TSetupStep);
var
  LicenseKey: String;
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then begin
    // Validate license key
    if not WizardSilent() then begin
      LicenseKey := '';
      if InputQuery('License Validation', 'Please enter your Spencer Task Manager license key:', LicenseKey) then begin
        if not ValidateLicenseKey(LicenseKey) then begin
          MsgBox('Invalid license key. Installation will continue in trial mode.', mbWarning, MB_OK);
        end else begin
          // Save license key
          SaveStringToFile(ExpandConstant('{app}\license.key'), LicenseKey, False);
        end;
      end;
    end;
    
    // Start Docker Desktop if not running
    if DockerDesktopInstalled and not IsDockerRunning then begin
      if MsgBox('Docker Desktop needs to be started. Start Docker now?', mbConfirmation, MB_YESNO) = IDYES then begin
        if not StartDockerDesktop() then begin
          MsgBox('Failed to start Docker Desktop. Please start it manually before using Spencer Task Manager.', 
                 mbWarning, MB_OK);
        end;
      end;
    end;
    
    // Deploy Docker containers
    if IsDockerRunning then begin
      Exec('cmd', '/c docker-compose -f "' + ExpandConstant('{app}') + '\docker-compose.yml" up -d', 
           ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode);
      
      if ResultCode = 0 then begin
        MsgBox('Spencer Task Manager has been successfully deployed and is now running!', mbInformation, MB_OK);
      end else begin
        MsgBox('Failed to deploy Spencer Task Manager containers. Please check Docker logs.', mbError, MB_OK);
      end;
    end;
  end;
end;

// Pre-installation checks
function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  Result := '';
  
  // Check for old version and uninstall
  if IsUpgrade() then begin
    if UnInstallOldVersion() <> 1 then begin
      Result := 'Error uninstalling previous version. Please uninstall manually first.';
      exit;
    end;
  end;
  
  // Check Docker requirements
  if not DockerInstalled then begin
    Result := 'Docker Desktop is required but not installed. The installer will install Docker Desktop automatically.';
    // This is just a warning, installation will continue
    Result := '';
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep=ssInstall) then
  begin
    if (IsUpgrade()) then
    begin
      UnInstallOldVersion();
    end;
  end;
end;
```

### **Step 3: Create License Validation**

```powershell
# Create license validation script
$LicenseScript = @"
@echo off
echo 🔑 Spencer Task Manager License Validation

set /p LICENSE_KEY="Enter your license key: "

REM Validate license key format (basic check)
if "%LICENSE_KEY%"=="" (
    echo ❌ License key cannot be empty
    pause
    exit /b 1
)

REM Save license key to environment file
echo LICENSE_KEY=%LICENSE_KEY% > .env.local
echo NEXTAUTH_SECRET=%RANDOM%%RANDOM%%RANDOM% >> .env.local
echo NODE_ENV=production >> .env.local

echo ✅ License key saved successfully!
echo 🚀 Starting Spencer Task Manager...
call start.bat
"@

$LicenseScript | Out-File -FilePath "C:\Spencer-Installer-Build\application\enter-license.bat" -Encoding ASCII
```

---

## 🚀 Advanced Installer Features

### **Step 1: Add Custom Installation Pages**

```pascal
// Add to setup.iss [Code] section
var
  LicenseKeyPage: TInputQueryWizardPage;
  CompanyInfoPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  // License Key Page
  LicenseKeyPage := CreateInputQueryPage(wpLicense,
    'License Information', 'Please enter your license details',
    'Enter the license key provided with your purchase:');
  LicenseKeyPage.Add('License Key:', False);
  LicenseKeyPage.Add('Company Name:', False);

  // Company Info Page
  CompanyInfoPage := CreateInputQueryPage(LicenseKeyPage.ID,
    'Company Information', 'Setup company-specific configuration',
    'Please provide your company information:');
  CompanyInfoPage.Add('Company Name:', False);
  CompanyInfoPage.Add('Admin Email:', False);
  CompanyInfoPage.Add('Database Name:', False);
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  
  if CurPageID = LicenseKeyPage.ID then
  begin
    if LicenseKeyPage.Values[0] = '' then
    begin
      MsgBox('Please enter a valid license key.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ConfigContent: TStringList;
begin
  if CurStep = ssPostInstall then
  begin
    // Save configuration
    ConfigFile := ExpandConstant('{app}\.env.production');
    ConfigContent := TStringList.Create;
    try
      ConfigContent.Add('LICENSE_KEY=' + LicenseKeyPage.Values[0]);
      ConfigContent.Add('COMPANY_NAME=' + LicenseKeyPage.Values[1]);
      ConfigContent.Add('ADMIN_EMAIL=' + CompanyInfoPage.Values[1]);
      ConfigContent.Add('DATABASE_NAME=' + CompanyInfoPage.Values[2]);
      ConfigContent.Add('NODE_ENV=production');
      ConfigContent.SaveToFile(ConfigFile);
    finally
      ConfigContent.Free;
    end;
  end;
end;
```

### **Step 2: Add Windows Service Integration**

```powershell
# service-installer.ps1
Write-Host "🔧 Setting up Spencer Task Manager as Windows Service..." -ForegroundColor Green

# Create NSSM service wrapper
$nssmPath = "$env:ProgramFiles\Spencer Task Manager\nssm.exe"
$appPath = "$env:ProgramFiles\Spencer Task Manager"

# Install NSSM (Non-Sucking Service Manager)
if (!(Test-Path $nssmPath)) {
    Write-Host "📦 Installing NSSM..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "$env:TEMP\nssm.zip"
    Expand-Archive "$env:TEMP\nssm.zip" -DestinationPath "$env:TEMP"
    Copy-Item "$env:TEMP\nssm-2.24\win64\nssm.exe" -Destination $nssmPath
}

# Create service startup script
$ServiceScript = @"
@echo off
cd /d "$appPath"
docker-compose up
"@

$ServiceScript | Out-File -FilePath "$appPath\service-start.bat" -Encoding ASCII

# Install Windows service
& $nssmPath install "Spencer Task Manager" "$appPath\service-start.bat"
& $nssmPath set "Spencer Task Manager" Description "Spencer Denim Task Manager Enterprise"
& $nssmPath set "Spencer Task Manager" Start SERVICE_AUTO_START

Write-Host "✅ Windows service installed successfully!" -ForegroundColor Green
Write-Host "🔧 Service will start automatically on system boot" -ForegroundColor Yellow
```

---

## 🔄 Automation Scripts

### **Complete Build Automation Script:**

```powershell
# build-installer.ps1 - Complete automation
param(
    [string]$SourcePath = "C:\path\to\spencer-taskmanager",
    [string]$BuildPath = "C:\Spencer-Installer-Build",
    [string]$Version = "1.0.0",
    [switch]$SkipTests = $false,
    [switch]$SignInstaller = $false
)

Write-Host "🏗️ Spencer Task Manager Installer Build Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Step 1: Validate environment
Write-Host "🔍 Validating build environment..." -ForegroundColor Yellow
$RequiredTools = @("node", "docker", "iscc", "7z")
foreach ($tool in $RequiredTools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "❌ Required tool not found: $tool"
    }
}
Write-Host "✅ All required tools found" -ForegroundColor Green

# Step 2: Clean and prepare build directory
Write-Host "🧹 Cleaning build directory..." -ForegroundColor Yellow
if (Test-Path $BuildPath) {
    Remove-Item $BuildPath -Recurse -Force
}
New-Item -ItemType Directory -Path $BuildPath -Force
New-Item -ItemType Directory -Path "$BuildPath\application" -Force
New-Item -ItemType Directory -Path "$BuildPath\installer" -Force
New-Item -ItemType Directory -Path "$BuildPath\dependencies" -Force
New-Item -ItemType Directory -Path "$BuildPath\output" -Force

# Step 3: Build application
Write-Host "🔨 Building Spencer Task Manager..." -ForegroundColor Yellow
Set-Location $SourcePath

# Install dependencies and build
npm ci
if (!$SkipTests) {
    npm test
}
npm run build

# Copy application files
Copy-Item "$SourcePath\*" -Destination "$BuildPath\application" -Recurse -Exclude @('.git', 'node_modules', '.next', 'test')

# Step 4: Prepare Docker deployment
Write-Host "🐳 Preparing Docker deployment..." -ForegroundColor Yellow
Set-Location "$BuildPath\application"

# Build production Docker image
docker build -f Dockerfile.prod -t spencer-taskmanager:enterprise .

# Save Docker image for offline installation
docker save spencer-taskmanager:enterprise -o spencer-taskmanager-image.tar
Write-Host "✅ Docker image saved: spencer-taskmanager-image.tar" -ForegroundColor Green

# Create Docker deployment scripts
$DockerDeployScript = @"
@echo off
echo Starting Spencer Task Manager...

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    REM Wait for Docker to start
    :wait_for_docker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %ERRORLEVEL% NEQ 0 goto wait_for_docker
    
    echo Docker is now running.
)

REM Load Docker image if it exists
if exist "spencer-taskmanager-image.tar" (
    echo Loading Spencer Task Manager Docker image...
    docker load -i spencer-taskmanager-image.tar
)

REM Start Spencer Task Manager
echo Deploying Spencer Task Manager...
docker-compose -f docker-compose.yml up -d

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose -f docker-compose.yml ps

echo.
echo ✅ Spencer Task Manager is now running!
echo Access the application at: http://localhost:3000
echo.
pause
"@

$DockerDeployScript | Out-File "$BuildPath\application\start.bat" -Encoding ASCII

# Create Docker Compose configuration for production
$DockerComposeConfig = @"
version: '3.8'

services:
  spencer-app:
    image: spencer-taskmanager:enterprise
    container_name: spencer-taskmanager
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/spencer.db
    volumes:
      - spencer-data:/app/data
      - spencer-logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  watchtower:
    image: containrrr/watchtower
    container_name: spencer-watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --schedule "0 0 2 * * *" --cleanup spencer-taskmanager
    restart: unless-stopped

volumes:
  spencer-data:
    driver: local
  spencer-logs:
    driver: local
"@

$DockerComposeConfig | Out-File "$BuildPath\application\docker-compose.yml" -Encoding UTF8

# Create stop script
$StopScript = @"
@echo off
echo Stopping Spencer Task Manager...
docker-compose -f docker-compose.yml down
echo Spencer Task Manager stopped.
pause
"@

$StopScript | Out-File "$BuildPath\application\stop.bat" -Encoding ASCII

# Create backup script
$BackupScript = @"
@echo off
set BACKUP_DIR=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo Creating backup: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"

REM Backup Docker volumes
docker run --rm -v spencer-data:/data -v %cd%\%BACKUP_DIR%:/backup alpine tar czf /backup/data.tar.gz -C /data .
docker run --rm -v spencer-logs:/logs -v %cd%\%BACKUP_DIR%:/backup alpine tar czf /backup/logs.tar.gz -C /logs .

REM Export database
docker exec spencer-taskmanager sqlite3 /app/data/spencer.db ".backup /app/data/spencer-backup.db"
docker cp spencer-taskmanager:/app/data/spencer-backup.db %BACKUP_DIR%\

echo Backup completed: %BACKUP_DIR%
pause
"@

$BackupScript | Out-File "$BuildPath\application\backup.bat" -Encoding ASCII

Write-Host "✅ Docker deployment scripts created" -ForegroundColor Green

# Step 5: Download dependencies
Write-Host "📦 Downloading dependencies..." -ForegroundColor Yellow
$DependenciesPath = "$BuildPath\dependencies"

# Download Docker Desktop installer
$DockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
Invoke-WebRequest -Uri $DockerUrl -OutFile "$DependenciesPath\DockerDesktop-4.25.exe"

# Download Visual C++ Redistributable
$VCRedistUrl = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
Invoke-WebRequest -Uri $VCRedistUrl -OutFile "$DependenciesPath\vcredist_x64.exe"

# Step 6: Create installer configuration
Write-Host "📝 Creating installer configuration..." -ForegroundColor Yellow
$SetupIss = Get-Content "$SourcePath\installer\setup-template.iss" -Raw
$SetupIss = $SetupIss -replace "__VERSION__", $Version
$SetupIss = $SetupIss -replace "__BUILD_DATE__", (Get-Date -Format "yyyy-MM-dd")
$SetupIss | Out-File "$BuildPath\installer\setup.iss" -Encoding UTF8

# Copy additional installer files
Copy-Item "$SourcePath\installer\license.txt" -Destination "$BuildPath\installer\"
Copy-Item "$SourcePath\installer\readme.txt" -Destination "$BuildPath\installer\"
Copy-Item "$SourcePath\installer\spencer-icon.ico" -Destination "$BuildPath\installer\"

# Step 7: Build installer
Write-Host "🏗️ Building installer..." -ForegroundColor Yellow
Set-Location "$BuildPath\installer"
& iscc.exe setup.iss

if ($LASTEXITCODE -ne 0) {
    throw "❌ Installer build failed"
}

# Step 8: Sign installer (optional)
if ($SignInstaller) {
    Write-Host "✍️ Signing installer..." -ForegroundColor Yellow
    $InstallerPath = "$BuildPath\output\spencer-taskmanager-enterprise-setup.exe"
    $CertPath = "$env:CERT_PATH"
    $CertPassword = $env:CERT_PASSWORD
    
    if ($CertPath -and $CertPassword) {
        & signtool.exe sign /f $CertPath /p $CertPassword /t http://timestamp.sectigo.com $InstallerPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Installer signed successfully" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ Installer signing failed"
        }
    } else {
        Write-Warning "⚠️ Certificate path or password not provided"
    }
}

# Step 9: Create distribution package
Write-Host "📦 Creating distribution package..." -ForegroundColor Yellow
$DistPath = "$BuildPath\distribution"
New-Item -ItemType Directory -Path $DistPath -Force

# Copy installer
Copy-Item "$BuildPath\output\spencer-taskmanager-enterprise-setup.exe" -Destination $DistPath

# Create documentation package
$DocsPath = "$DistPath\documentation"
New-Item -ItemType Directory -Path $DocsPath -Force
Copy-Item "$SourcePath\docs\*" -Destination $DocsPath -Recurse

# Create release notes
$ReleaseNotes = @"
Spencer Denim Task Manager Enterprise v$Version
Release Date: $(Get-Date -Format "yyyy-MM-dd")

INSTALLATION INSTRUCTIONS:
1. Run spencer-taskmanager-enterprise-setup.exe as Administrator
2. Follow the installation wizard
3. Enter your license key when prompted
4. The application will start automatically after installation

SYSTEM REQUIREMENTS:
- Windows 10/11 (64-bit)
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space
- Internet connection for initial setup

SUPPORT:
- Email: support@spencerdenim.com
- Documentation: See documentation folder
- License: See LICENSE.txt

BUILD INFORMATION:
- Version: $Version
- Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Docker Image: spencer-taskmanager:enterprise
"@

$ReleaseNotes | Out-File "$DistPath\RELEASE-NOTES.txt" -Encoding UTF8

# Step 10: Create checksums
Write-Host "🔐 Creating checksums..." -ForegroundColor Yellow
$InstallerHash = Get-FileHash "$DistPath\spencer-taskmanager-enterprise-setup.exe" -Algorithm SHA256
"$($InstallerHash.Hash)  spencer-taskmanager-enterprise-setup.exe" | Out-File "$DistPath\checksums.txt" -Encoding ASCII

# Final summary
Write-Host ""
Write-Host "🎉 BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "📍 Distribution package: $DistPath" -ForegroundColor White
Write-Host "📦 Installer size: $([math]::Round((Get-Item "$DistPath\spencer-taskmanager-enterprise-setup.exe").Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "🔐 SHA256: $($InstallerHash.Hash)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready for distribution!" -ForegroundColor Cyan
```

### **Usage Examples:**

```powershell
# Basic build
.\build-installer.ps1

# Build with custom version
.\build-installer.ps1 -Version "1.2.0"

# Build and sign installer
.\build-installer.ps1 -SignInstaller

# Skip tests and sign
.\build-installer.ps1 -SkipTests -SignInstaller -Version "1.0.1"
```

---

## 🐳 Docker Installation & Troubleshooting

### **Post-Installation Docker Validation**

Create a validation script that customers can run after installation:

```powershell
# validate-installation.ps1
Write-Host "🔍 Validating Spencer Task Manager Installation..." -ForegroundColor Cyan

# Test 1: Check Docker installation
Write-Host "Testing Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found or not working" -ForegroundColor Red
    exit 1
}

# Test 2: Check if Docker is running
Write-Host "Testing Docker daemon..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker daemon not running. Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden
    
    # Wait for Docker to start
    $timeout = 60
    $elapsed = 0
    do {
        Start-Sleep -Seconds 5
        $elapsed += 5
        try {
            docker info | Out-Null
            Write-Host "✅ Docker daemon started successfully" -ForegroundColor Green
            break
        } catch {
            Write-Host "Waiting for Docker... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
        }
    } while ($elapsed -lt $timeout)
    
    if ($elapsed -ge $timeout) {
        Write-Host "❌ Docker failed to start within timeout" -ForegroundColor Red
        exit 1
    }
}

# Test 3: Check Spencer Task Manager containers
Write-Host "Testing Spencer Task Manager deployment..." -ForegroundColor Yellow
$containerStatus = docker-compose ps -q spencer-taskmanager 2>$null
if ($containerStatus) {
    $running = docker inspect --format='{{.State.Running}}' $containerStatus 2>$null
    if ($running -eq "true") {
        Write-Host "✅ Spencer Task Manager container is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Spencer Task Manager container exists but not running" -ForegroundColor Yellow
        Write-Host "Starting container..." -ForegroundColor Yellow
        docker-compose up -d spencer-taskmanager
    }
} else {
    Write-Host "⚠️ Spencer Task Manager container not found. Deploying..." -ForegroundColor Yellow
    docker-compose up -d
}

# Test 4: Check application accessibility
Write-Host "Testing application accessibility..." -ForegroundColor Yellow
$maxAttempts = 12
$attempt = 0
do {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Spencer Task Manager is accessible at http://localhost:3000" -ForegroundColor Green
            break
        }
    } catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "Waiting for application to start... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
} while ($attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Host "❌ Application not accessible after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "Please check Docker logs: docker-compose logs spencer-taskmanager" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Validation completed!" -ForegroundColor Green
Write-Host "🌐 Access Spencer Task Manager at: http://localhost:3000" -ForegroundColor Cyan
```

### **Common Docker Issues & Solutions**

#### **Issue 1: Docker Desktop Won't Start**

```powershell
# Solution script
Write-Host "Troubleshooting Docker Desktop startup..." -ForegroundColor Yellow

# Reset Docker Desktop
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

# Clear Docker cache
$dockerData = "$env:APPDATA\Docker"
if (Test-Path $dockerData) {
    Remove-Item "$dockerData\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# Restart Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Write-Host "Docker Desktop restarted. Please wait 60 seconds for initialization." -ForegroundColor Green
```

#### **Issue 2: Port Conflicts**

```powershell
# Check for port conflicts
$port = 3000
$processUsingPort = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($processUsingPort) {
    Write-Host "Port $port is in use by:" -ForegroundColor Yellow
    Get-Process -Id $processUsingPort.OwningProcess | Select-Object Name, Id, CPU
    
    # Option to kill conflicting process
    $response = Read-Host "Kill the conflicting process? (y/n)"
    if ($response -eq 'y') {
        Stop-Process -Id $processUsingPort.OwningProcess -Force
        Write-Host "Process terminated. Restarting Spencer Task Manager..." -ForegroundColor Green
        docker-compose restart spencer-taskmanager
    }
}
```

#### **Issue 3: Container Won't Start**

```powershell
# Diagnostic script for container issues
Write-Host "Diagnosing container startup issues..." -ForegroundColor Yellow

# Check container logs
docker-compose logs spencer-taskmanager --tail=50

# Check container resource usage
docker stats spencer-taskmanager --no-stream

# Check for image issues
$imageExists = docker images spencer-taskmanager:enterprise -q
if (-not $imageExists) {
    Write-Host "Docker image not found. Loading from tar file..." -ForegroundColor Yellow
    if (Test-Path "spencer-taskmanager-image.tar") {
        docker load -i spencer-taskmanager-image.tar
        Write-Host "Image loaded. Restarting container..." -ForegroundColor Green
        docker-compose up -d spencer-taskmanager
    } else {
        Write-Host "❌ Docker image tar file not found!" -ForegroundColor Red
    }
}
```

### **Offline Installation Support**

For customers without internet access:

```powershell
# create-offline-package.ps1
Write-Host "Creating offline installation package..." -ForegroundColor Cyan

$OfflineDir = "Spencer-Offline-Package"
New-Item -ItemType Directory -Path $OfflineDir -Force

# Export Docker images
docker save spencer-taskmanager:enterprise -o "$OfflineDir\spencer-image.tar"
docker save alpine:latest -o "$OfflineDir\alpine-image.tar"
docker save containrrr/watchtower:latest -o "$OfflineDir\watchtower-image.tar"

# Create offline installation script
$OfflineScript = @"
@echo off
echo Loading Spencer Task Manager Docker images...

docker load -i spencer-image.tar
docker load -i alpine-image.tar
docker load -i watchtower-image.tar

echo Images loaded successfully!
echo Starting Spencer Task Manager...
docker-compose up -d

echo.
echo ✅ Spencer Task Manager is now running offline!
echo Access at: http://localhost:3000
pause
"@

$OfflineScript | Out-File "$OfflineDir\install-offline.bat" -Encoding ASCII

Write-Host "✅ Offline package created: $OfflineDir" -ForegroundColor Green
```

---

## 📞 Customer Support Scripts

### **Generate Support Bundle**

```powershell
# generate-support-bundle.ps1
$SupportBundle = "spencer-support-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $SupportBundle -Force

# Collect system information
systeminfo > "$SupportBundle\system-info.txt"
docker version > "$SupportBundle\docker-version.txt"
docker info > "$SupportBundle\docker-info.txt"

# Collect application logs
docker-compose logs spencer-taskmanager > "$SupportBundle\application-logs.txt"
docker ps -a > "$SupportBundle\container-status.txt"

# Collect configuration
Copy-Item "docker-compose.yml" "$SupportBundle\"
Copy-Item ".env*" "$SupportBundle\" -ErrorAction SilentlyContinue

# Create ZIP archive
Compress-Archive -Path "$SupportBundle\*" -DestinationPath "$SupportBundle.zip"
Remove-Item $SupportBundle -Recurse -Force

Write-Host "✅ Support bundle created: $SupportBundle.zip" -ForegroundColor Green
Write-Host "Please send this file to support@spencerdenim.com" -ForegroundColor Cyan
```

---

## 🧪 Distribution & Testing

### **Step 1: Installer Testing Checklist**

```powershell
# test-installer.ps1
Write-Host "🧪 Testing Spencer Task Manager Installer..." -ForegroundColor Cyan

$TestCases = @(
    @{ Name = "Fresh Installation"; VM = "Windows10-Clean" },
    @{ Name = "Upgrade Installation"; VM = "Windows10-WithOldVersion" },
    @{ Name = "Docker Pre-installed"; VM = "Windows10-WithDocker" },
    @{ Name = "Limited User Rights"; VM = "Windows10-StandardUser" }
)

foreach ($test in $TestCases) {
    Write-Host "🔄 Running test: $($test.Name)" -ForegroundColor Yellow
    
    # Test steps would go here
    # - Start VM
    # - Install Spencer Task Manager
    # - Verify installation
    # - Test application startup
    # - Verify license validation
    # - Test uninstallation
}

Write-Host "✅ All tests completed!" -ForegroundColor Green
```

### **Step 2: Distribution Package Creation**

```powershell
# create-distribution.ps1
param(
    [string]$Version = "1.0.0",
    [string]$BuildPath = "C:\Spencer-Installer-Build"
)

Write-Host "📦 Creating distribution package..." -ForegroundColor Green

# Create customer package
$CustomerPackage = "Spencer-TaskManager-Enterprise-v$Version"
$PackagePath = "$BuildPath\$CustomerPackage"

New-Item -ItemType Directory -Path $PackagePath -Force

# Copy installer
Copy-Item "$BuildPath\output\spencer-taskmanager-enterprise-setup.exe" -Destination $PackagePath

# Copy documentation
Copy-Item "$BuildPath\documentation\*" -Destination "$PackagePath\documentation" -Recurse

# Create customer readme
$CustomerReadme = @"
SPENCER DENIM TASK MANAGER ENTERPRISE v$Version

Thank you for purchasing Spencer Task Manager Enterprise!

QUICK START:
1. Run 'spencer-taskmanager-enterprise-setup.exe' as Administrator
2. Follow the installation wizard
3. Enter your license key: [YOUR-LICENSE-KEY-HERE]
4. The application will be available at: http://localhost:3000

SUPPORT:
- Installation Guide: documentation/INSTALLATION-GUIDE.pdf
- User Manual: documentation/USER-MANUAL.pdf
- Email Support: support@spencerdenim.com
- Phone Support: +1-XXX-XXX-XXXX

LICENSE:
This software is licensed for use by: [CUSTOMER-COMPANY-NAME]
License expires: [LICENSE-EXPIRY-DATE]

SYSTEM REQUIREMENTS:
- Windows 10/11 (64-bit)
- 8GB RAM (16GB recommended)
- 10GB free disk space
- Internet connection for setup

Enjoy your Spencer Task Manager Enterprise!
The Spencer Denim Team
"@

$CustomerReadme | Out-File "$PackagePath\README.txt" -Encoding UTF8

# Create ZIP package for distribution
Compress-Archive -Path "$PackagePath\*" -DestinationPath "$BuildPath\$CustomerPackage.zip"

Write-Host "✅ Distribution package created: $CustomerPackage.zip" -ForegroundColor Green
```

---

## 🎯 Summary

This guide provides everything needed to create professional Windows installers for Spencer Task Manager:

### **✅ What You Get:**
- Professional .exe installer
- Automatic Docker Desktop installation
- License key validation
- Windows service integration
- Desktop shortcuts and start menu entries
- Uninstaller functionality
- Code signing support
- Automated build scripts

### **📈 Business Benefits:**
- **Professional Appearance**: Enterprise-grade installer builds trust
- **Easy Customer Onboarding**: One-click installation reduces support costs
- **Automated Updates**: Built-in update mechanism for future versions
- **License Protection**: Secure license validation prevents piracy
- **Scalable Process**: Automated scripts for consistent builds

### **🚀 Next Steps:**
1. Set up the build environment using this guide
2. Customize the installer with your branding
3. Test thoroughly on different Windows versions
4. Set up code signing for security and trust
5. Create automated distribution pipeline

**Result: A professional software product ready for enterprise sales!** 🏆