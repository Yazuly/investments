#!/bin/bash

# Set the DEBIAN_FRONTEND variable to noninteractive to avoid interactive prompts
export DEBIAN_FRONTEND=noninteractive

# Function to check if sudo is available
use_sudo() {
    if sudo -n true 2>/dev/null; then 
        echo "sudo is available. Using sudo for installation."
        install_node_with_sudo
    else
        echo "sudo not found. Installing without sudo."
        install_node_without_sudo
    fi
}

# Function to install Node.js and npm using sudo
install_node_with_sudo() {
    sudo apt-get update
    sudo apt-get install -y nodejs npm
}

# Function to install Node.js and npm without using sudo
install_node_without_sudo() {
    apt-get update
    apt-get install -y nodejs npm
}

# Check if Node.js and npm are already installed
check_and_install_node() {
    if which node > /dev/null && which npm > /dev/null; then
        echo "Node.js and npm are already installed."
    else
        echo "Node.js or npm not found. Installing..."
        use_sudo
    fi
}

# Run npm install
run_npm_install() {
    echo "Running npm install..."
    npm install
}

# Main function
main() {
    check_and_install_node
    run_npm_install

    # Verify the installation
    node_version=$(node -v)
    npm_version=$(npm -v)
    echo "Node.js version: $node_version"
    echo "NPM version: $npm_version"
}

# Execute main function
main

