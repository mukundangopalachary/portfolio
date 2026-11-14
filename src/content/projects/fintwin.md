---
title: "FinTwin"
description: "Personal finance platform built on a microservice architecture with Kafka-based async communication and JWT authentication."
status: "complete"
techs: ["Java", "Spring Boot", "Spring Cloud", "Next.js", "PostgreSQL", "Redis", "Kafka", "Docker Compose"]
github: "https://github.com/mukundangopalachary/fintwin"
featured: true
order: 2
---

## Overview

FinTwin is a personal finance platform built as a microservice system using Spring Boot and Spring Cloud. It handles financial transaction ingestion, categorisation, and reporting with an asynchronous intelligence pipeline.

## Architecture

The platform is composed of multiple services orchestrated with Docker Compose:

- **API Gateway** — Reactive gateway handling routing and cross-cutting concerns
- **Auth Service** — JWT issuance, refresh-token rotation, and Redis-backed revocation
- **Transaction Service** — Financial transaction processing and storage
- **Intelligence Service** — Python-based async categorisation via Gemini
- **Eureka Server** — Service discovery registry

## Engineering highlights

### Service discovery
Services register with Eureka on startup. The API gateway resolves service locations dynamically, enabling independent deployment of individual services.

### Reactive API gateway
The gateway is built with Spring Cloud Gateway (reactive/non-blocking). It handles routing, JWT verification, and rate limiting before requests reach downstream services.

### Kafka-based async pipeline
When a transaction is processed, an event is published to a Kafka topic. The intelligence service consumes these events and uses Gemini to categorise transactions by type. Results are written back asynchronously.

### Authentication and token lifecycle
The auth service issues short-lived JWTs and long-lived refresh tokens. Refresh tokens are stored in a Redis set. On logout or token rotation, tokens are added to a Redis revocation list checked on every request.

### PostgreSQL persistence
Each service owns its own schema. Services do not share database connections across service boundaries.

## Status
Core services implemented. Transaction processing, auth, Kafka pipeline, and service discovery are functional.
