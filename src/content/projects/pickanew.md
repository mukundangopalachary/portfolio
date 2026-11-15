---
title: "PickANew"
description: "News feed platform with user authentication, topic subscriptions, and article management."
status: "complete"
techs: ["Java", "Spring Boot", "Spring Security", "PostgreSQL", "Redis", "Kafka", "Flyway", "Next.js", "TypeScript"]
github: "https://github.com/mukundangopalachary/pickanew-newsfeed"
images:
  - "/content/pickanew1.png"
  - "/content/pickanew2.png"
  - "/content/pickanew3.png"
  - "/content/pickanew4.png"
  - "/content/pickanew5.png"
  - "/content/pickanew6.png"
  - "/content/pickanew7.png"
featured: true
order: 3
---

## Overview

PickANew is a news feed platform that lets users subscribe to topics and receive curated article feeds. The backend is built with Spring Boot and Spring Security; the frontend uses Next.js with TypeScript.

## Features

- **User authentication and authorisation** — Registration, login, role-based access control via Spring Security
- **Article management** — CRUD operations for articles with topic tagging
- **Topic management** — Create, list, and manage news topics
- **User subscriptions** — Users can subscribe to topics; feeds are filtered accordingly
- **Asynchronous notifications** — Kafka-based notification pipeline for new articles in subscribed topics
- **Database migrations** — Schema managed with Flyway; migrations are version-controlled
- **Redis integration** — Caching layer for session and query optimisation

## Status
Complete.
