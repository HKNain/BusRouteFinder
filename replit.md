# Bus ETA Prototype

## Overview

This is a real-time bus tracking web application that simulates a Delhi bus route from ISBT Kashmiri Gate to Mehrauli Terminal. The app provides three distinct viewing modes for tracking bus progress and estimated arrival times: an interactive Google Maps view, an order-tracking style stepper view, and a simple tabular text view. Built as a full-stack TypeScript application with React frontend and Express backend, it demonstrates modern web development practices with real-time data simulation and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks with custom `useBusTracking` hook for bus position simulation
- **Data Fetching**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reload with Vite integration in development mode
- **Build**: ESBuild for production bundling
- **Storage**: In-memory storage interface with extensible design for future database integration

### Data Storage Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: User authentication schema defined in shared directory
- **Migration**: Drizzle Kit for database migrations
- **Current State**: Memory-based storage for prototyping, ready for PostgreSQL integration

### Component Architecture
- **Layout**: Three switchable view modes (Map, Order-tracking, Text)
- **Map Component**: Google Maps integration with polyline routes and animated bus markers
- **Order Component**: Stepper-style progress indicator with completion states
- **Text Component**: Tabular view with expandable stop listings
- **Hooks**: Custom `useBusTracking` hook manages bus position simulation and ETA updates

### Real-time Simulation
- **Bus Movement**: Simulated bus progression through 29 predefined stops
- **ETA Updates**: Random but realistic arrival time generation (2-10 minutes)
- **Status Tracking**: Three-state system (completed, current, upcoming) for each stop
- **Update Intervals**: 5-second ETA refresh, 30-second bus movement simulation

## External Dependencies

### Map Services
- **Google Maps JavaScript API**: Interactive map display with custom markers and polylines
- **API Configuration**: Environment variable based API key management

### UI Framework
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library for UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

### Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **Replit Integration**: Runtime error overlay and development banner
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Build and Runtime
- **TypeScript**: Strict type checking across client and server
- **ESBuild**: Fast JavaScript bundler for production builds
- **Express**: Web server framework with static file serving