<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: UPDATED - Updated to reflect 14-stage pipeline, new storage architecture, and current system state
Status: Current  
Review Notes: Updated product count, content types, storage system, and removed outdated limitations
-->

# BN Products Documentation

## Overview
This documentation describes the current architecture and functionality of the BN Products showcase system, a React-based platform for managing and presenting AI consultancy products and services.

**Current Status**: Production-ready with Redis storage, advanced search, and optimized content pipeline.

## Table of Contents

1. [Architecture Overview](./architecture-overview.md) - High-level system design
2. [Product Structure](./product-structure.md) - Product data schema and 14-stage pipeline  
3. [Current Storage System](./current-storage-system.md) - Redis + localStorage dual storage
4. [Compilation System](./compilation-system.md) - Content compilation workflow
5. [Data Flow](./data-flow.md) - How data moves through the system
6. [UI Components](./ui-components.md) - Frontend components guide
7. [Admin System](./admin-system.md) - Admin panel functionality
8. [Development Plan](./development-plan.md) - Sprint progress and roadmap

## Quick Start

The system runs as a React application with dual storage (Redis + localStorage):

```bash
npm install
npm run dev
```

Visit:
- Main dashboard: http://localhost:5173 (with advanced search and quick view)
- Admin panel: http://localhost:5173/admin

## Key Concepts

- **Products**: 8 AI consultancy offerings (4 products, 4 services)
- **14-Stage Pipeline**: Canonical content generation (00→01→02→03)  
- **Rich Content**: 14 content types per product (executive positioning, ICPs, etc.)
- **Three Compilation Types**: Marketing, Market Intelligence, Product Strategy
- **Dual Storage**: Redis-first with localStorage fallback
- **Advanced Search**: Real-time filtering across all product content

## Current Capabilities

- ✅ **Production Storage**: Redis (Vercel KV) with localStorage fallback
- ✅ **Advanced Search**: Real-time search across all content (300ms debounced)
- ✅ **Quick Access**: Modal-based product preview without navigation
- ✅ **Mobile Optimized**: Responsive design for consultant field use
- ✅ **Content Pipeline**: Automated 4-stage processing from CSV to deployment
- ✅ **Data Quality**: Smart parsing prevents content splitting issues
- ✅ **Performance**: <30 second response times for product lookup