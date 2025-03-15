# Load Balancer in TypeScript

This project implements a load balancer in Node.js using TypeScript. It supports both health checks and common load balancing strategies like simple round-robin, weighted round-robin, least connections etc. The project leverages Express.js for request routing, TypeDI for dependency injection, and Cron for scheduling periodic health checks.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Docker & Makefile](#docker--makefile)
- [Contributing](#contributing)

## Features

- **Multiple Load Balancing Strategies:**
  - **Simple Round-Robin:** Cycles through available healthy targets.
  - **Weighted Round-Robin:** Routes traffic based on target weights.
  - **Least Connections:** Routes traffic based on the target having the least number of active connections.
- **Health Checks:** Periodically checks each target’s health using configurable cron jobs.
- **HTTP Forwarding:** Forwards incoming HTTP requests to healthy targets, maintaining request headers and body.
- **Connection Pooling** - Maintains a persistent pool of HTTP connections to the targets.
- **Dependency Injection:** Uses TypeDI for loosely coupled services.
- **Containerization:** Dockerfile and Makefile provided for building, running, and managing the containerized application.

## Architecture

The application is organized into several key modules:

- **Clients:**
  - `src/clients/HttpClient.ts` handles outbound HTTP requests, maintaining connection pools with configurable keep-alive settings.
- **Models:**
  - `src/models/Target.ts` represents a Target, which is a server to which the load balancer can route it's requests to.
- **Strategies:**
  - `src/service/strategy/BaseLoadBalancerStrategy.ts` defines the interface for load balancing strategies.
  - `src/service/strategy/LoadBalancerStrategyFactory.ts` factory class for the different strategies.
  - `src/service/strategy/SimpleLoadBalancerStrategy.ts` implements a round-robin approach.
  - `src/service/strategy/WeightedLoadBalancerStrategy.ts` implements a weighted round-robin mechanism.
  - `src/service/strategy/LeastConnectionsLoadBalancerStrategy.ts` implements a least active connections mechanism.
- **Services:**
  - `src/service/HealthChecker.ts` performs periodic health checks on targets using a cron job.
  - `src/service/LoadBalancer.ts` selects a healthy target based on the chosen strategy and forwards the HTTP request.
- **Server & App Initialization:**

  - `src/server.ts` sets up the Express.js server, binds the load balancer route, and starts the health checking service.
  - `src/app.ts` is the application entry point.

- **Types & Configuration:**
  - `src/types/index.ts` defines the data types for targets and load balancing strategies.
  - `src/utils/config.ts` holds the configuration for the server port, load balancing options, and health check settings.

## Installation

- **Clone the Repository:**
  ```
  git clone https://github.com/rajarshisg/load-balancer.git
  cd load-balancer
  ```
- **Install Dependencies:**
  `npm install`
- **Build & Start the Application:**
  `npm run start`

## Configuration

The application is configured via `src/utils/config.ts`. Key settings include:

- **Server Port**:
  - `server.port`: Port on which the load balancer runs.
- **Load Balancer Settings**:
  - `loadBalancer.targetGroup`: An array of target servers with details like host, port, health check route, and weight (optional, used in case of weighted load balancing).
  - `loadBalancer.algorithm`: Choose between "SIMPLE" or "WEIGHTED" or "LEAST_CONNECTIONS" strategies.
  - `loadBalancer.healthChecks.enabled`: Enable or disable health checks.
  - `loadBalancer.healthChecks.cron`: Cron expression for scheduling health checks (default runs every minute).

## Docker & Makefile

- **Dockerfile:**
  The provided Dockerfile builds the application into a container using Node.js 22-slim:

  - It installs dependencies and TypeScript globally.
  - Compiles the TypeScript files and exposes port `3000`.
  - The container starts the application with `node dist/app.js`.

- **Makefile:**
  The Makefile simplifies common tasks:

  - build: Builds the Docker image.
  - run: Runs the container (builds if not already built).
  - stop: Stops and removes the running container.
  - clean: Removes the Docker image.
  - rebuild: Cleans up and rebuilds the image.

  Example Usage:

  ```
  make run       # Build and run the Docker container
  make stop      # Stop and remove the container
  make rebuild   # Clean and rebuild the Docker image
  ```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for improvements or bug fixes.
