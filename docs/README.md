# BN Products Documentation

## Overview
This documentation describes the current architecture and functionality of the BN Products showcase system, a React-based platform for managing and presenting AI consultancy products and services.

## Table of Contents

1. [Architecture Overview](./architecture-overview.md) - High-level system design
2. [Current Storage System](./current-storage-system.md) - How localStorage is used
3. [Compilation System](./compilation-system.md) - Content compilation workflow
4. [Data Flow](./data-flow.md) - How data moves through the system
5. [Product Structure](./product-structure.md) - Product data schema
6. [UI Components](./ui-components.md) - Frontend components guide
7. [Admin System](./admin-system.md) - Admin panel functionality
8. [API Design](./api-design.md) - Current pseudo-API structure

## Quick Start

The system currently runs as a client-side React application with localStorage for persistence:

```bash
npm install
npm run dev
```

Visit:
- Main dashboard: http://localhost:5173
- Admin panel: http://localhost:5173/admin

## Key Concepts

- **Products**: 8 AI consultancy offerings (4 products, 4 services)
- **Compilation**: AI-powered content synthesis from multiple sources
- **Rich Content**: 15 content types per product (manifesto, user stories, etc.)
- **Three Compilation Types**: Marketing, Market Intelligence, Product Strategy

## Current Limitations

- Browser-specific storage (localStorage)
- No real-time collaboration
- No server-side persistence
- Single-user editing