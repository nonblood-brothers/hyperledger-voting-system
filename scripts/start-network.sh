#!/usr/bin/env bash

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
network_dir=$script_dir/../network/test-network
gateway_dir=$script_dir/../gateway

cleanup() {
    echo "Cleaning up network..."
    # Save the current directory
    local current_dir=$(pwd)
    # Get the script directory
    # Navigate to the test-network directory
    cd "$script_dir/../network/test-network"
    # Run the network down command
    ./network.sh down
    echo "Network cleanup completed."
    # Return to the original directory (not strictly necessary as the script is exiting)
    cd "$current_dir"
}

# Register the cleanup function to be called on script exit
trap cleanup EXIT

# Exit on any error
set -e

echo "Starting test network..."

"$network_dir"/network.sh up createChannel -ca -c vs -s couchdb

echo "Deploying chaincode..."
"$network_dir"/network.sh deployCC -ccn voting_system -ccp ../../chaincode -ccl typescript -c vs -cci InitLedger

echo "Starting gateway service..."

echo "Loading environment variables from .env file..."
export $(grep -v '^#' "$gateway_dir"/.env | xargs)

# Run the gateway service
cd "$gateway_dir" && npm run start
