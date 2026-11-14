---
title: "PickANew"
description: "News feed platform with user authentication, topic subscriptions, and article management. Under active development."
status: "active"
techs: ["Java", "Spring Boot", "Spring Security", "PostgreSQL", "Redis", "Kafka", "Flyway", "Next.js", "TypeScript"]
github: "https://github.com/mukundangopalachary/pickanew-newsfeed"
featured: true
order: 3
---

## Overview

PickANew is a news feed platform that lets users subscribe to topics and receive curated article feeds. The backend is built with Spring Boot and Spring Security; the frontend uses Next.js with TypeScript.

## What is currently implemented

- **User authentication and authorisation** — Registration, login, role-based access control via Spring Security
- **Article management** — CRUD operations for articles with topic tagging
- **Topic management** — Create, list, and manage news topics
- **User subscriptions** — Users can subscribe to topics; feeds are filtered accordingly
- **Database migrations** — Schema managed with Flyway; migrations are version-controlled
- **Redis integration** — Caching layer integrated for session and query optimisation

## What is planned

- **Asynchronous notifications** — Kafka-based notification pipeline for new articles in subscribed topics (not yet implemented)
- Further personalisation features

## Status
Under active development. Authentication, article/topic management, subscriptions, and migrations are functional. The Kafka notification pipeline is planned but not yet built.
