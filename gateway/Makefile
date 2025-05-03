# Makefile for the gateway application
# This Makefile includes all scripts from package.json and imports environment variables from .env file

# Import environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Default target
.PHONY: all
all: build

# Build the application
.PHONY: build
build:
	npm run build

# Lint the source code
.PHONY: lint
lint:
	npm run lint

# Prepare the application (runs build)
.PHONY: prepare
prepare:
	npm run prepare

# Run pretest (runs lint)
.PHONY: pretest
pretest:
	npm run pretest

# Start the application
.PHONY: start
start:
	npm run start

# Start the application in development mode
.PHONY: start-dev
start-dev:
	npm run start:dev

# Install dependencies
.PHONY: install
install:
	npm install

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf dist

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all        - Default target, builds the application"
	@echo "  build      - Build the application"
	@echo "  lint       - Lint the source code"
	@echo "  prepare    - Prepare the application (runs build)"
	@echo "  pretest    - Run pretest (runs lint)"
	@echo "  start      - Start the application"
	@echo "  start-dev  - Start the application in development mode"
	@echo "  install    - Install dependencies"
	@echo "  clean      - Clean build artifacts"
	@echo "  help       - Show this help message"
	@echo ""
	@echo "Environment variables from .env file are automatically loaded"