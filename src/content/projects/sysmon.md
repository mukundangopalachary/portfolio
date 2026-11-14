---
title: "Sysmon"
description: "Terminal-based Linux system monitor that reads /proc interfaces and renders live telemetry in an interactive ncurses UI."
status: "complete"
techs: ["C++", "Linux", "CMake", "ncurses", "pthreads", "TOML", "JSON", "IPC"]
github: "https://github.com/mukundangopalachary/sysmon"
images:
  - "/content/sysmon_dashboard.jpeg"
  - "/content/sysmon_process.jpeg"
  - "/content/sysmon_network.jpeg"
  - "/content/sysmon_plugins.jpeg"
featured: true
order: 1
---

## Overview

Sysmon is a terminal-based Linux system monitoring application written in C++. It collects and displays real-time system telemetry by reading Linux `/proc` filesystem interfaces directly — no external monitoring agents required.

## Engineering highlights

### /proc interface reads
Sysmon reads CPU usage, memory consumption, process lists, and network statistics directly from the Linux `/proc` filesystem. This avoids subprocess calls to tools like `top` or `ps` and gives consistent, low-overhead data access.

### Double-buffered SnapshotManager
A `SnapshotManager` maintains two alternating telemetry snapshots. While one snapshot is being displayed, the background thread populates the other. This eliminates display tearing and ensures the UI always shows a consistent system state.

### Concurrent execution
Monitoring and plugin management run on separate threads using POSIX threads (`pthreads`). The monitoring thread collects data at a configurable interval while the main thread handles UI rendering and input.

### Plugin system via IPC
Sysmon supports isolated shell-script plugins. Each plugin runs as a child process and communicates with the monitor through a custom IPC channel using JSON-formatted messages. This keeps plugins isolated from the core monitor process.

### Interactive terminal UI
Built with ncurses, the UI supports keyboard navigation, scrollable process lists, and network inspection. Configuration is read from a TOML file at startup.

## Status
Complete. Core monitoring, UI, and plugin IPC are implemented.
