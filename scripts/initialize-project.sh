#!/usr/bin/env bash

# initialize-project.sh
# This script initializes all components of the voting system project by installing
# dependencies for the frontend, gateway, and chaincode components.

# Exit on any error
set -e

# Get the script directory
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_root="$script_dir/.."

echo "=== Initializing Voting System Project ==="
echo "This script will install all dependencies required to run the project."

# Function to install dependencies for a component
install_dependencies() {
    local component=$1
    echo ""
    echo "=== Installing dependencies for $component ==="
    cd "$project_root/$component"
    
    if [ -f "package.json" ]; then
        echo "Running npm install for $component..."
        npm install
        echo "$component dependencies installed successfully."
    else
        echo "No package.json found for $component. Skipping dependency installation."
    fi
}

# Install dependencies for each component
install_dependencies "frontend"
install_dependencies "gateway"
install_dependencies "chaincode"

# Check if network/test-network directory exists
if [ -d "$project_root/network/test-network" ]; then
    echo ""
    echo "=== Checking test network ==="
    cd "$project_root/network/test-network"
    
    # Check if network.sh is executable
    if [ -f "network.sh" ] && [ ! -x "network.sh" ]; then
        echo "Making network.sh executable..."
        chmod +x network.sh
    fi
else
    echo ""
    echo "Warning: test-network directory not found at $project_root/network/test-network"
    echo "The test network may not be properly set up."
fi

# Make sure start-network.sh is executable
if [ -f "$script_dir/start-network.sh" ] && [ ! -x "$script_dir/start-network.sh" ]; then
    echo ""
    echo "Making start-network.sh executable..."
    chmod +x "$script_dir/start-network.sh"
fi

echo ""
echo "=== Project initialization complete ==="
echo "You can now start the network using: ./scripts/start-network.sh"