# Set the policy to bypass the execution policy temporarily
Set-ExecutionPolicy Bypass -Scope Process -Force

# Function to check if Node.js and npm are already installed
function Check-And-Install-Node {
    $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
    $npmInstalled = Get-Command npm -ErrorAction SilentlyContinue

    if ($nodeInstalled -and $npmInstalled) {
        Write-Host "Node.js and npm are already installed."
    } else {
        Write-Host "Node.js or npm not found. Installing..."
        Install-Node
    }
}

# Function to install Node.js and npm
function Install-Node {
    # Using Chocolatey to install Node.js. Chocolatey is a package manager for Windows
    Write-Host "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    
    Write-Host "Using Chocolatey to install Node.js and npm..."
    choco install nodejs -y
}

# Run npm install
function Run-Npm-Install {
    Write-Host "Running npm install..."
    npm install
}

# Main function
function Main {
    Check-And-Install-Node
    Run-Npm-Install

    # Verify the installation
    $node_version = node -v
    $npm_version = npm -v
    Write-Host "Node.js version: $node_version"
    Write-Host "NPM version: $npm_version"
}

# Execute main function
Main

