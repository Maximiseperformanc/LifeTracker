# Overview

LifeTrack Pro is a comprehensive personal development dashboard application built with React, Express, and PostgreSQL. The application helps users track their habits, manage goals, monitor health metrics, run focus timers (Pomodoro technique), and gain insights into their productivity patterns. It features a modern, responsive UI with data visualization and export capabilities, designed to support users in building better habits and achieving their personal development goals.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with **React 18** using a component-based architecture:

- **UI Framework**: Utilizes shadcn/ui components built on top of Radix UI primitives for accessible, customizable UI components
- **Styling**: TailwindCSS with CSS custom properties for theming, supporting both light and dark modes
- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management with optimistic updates and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The application follows a modular structure with separate directories for pages, components (organized by feature), hooks, and utilities.

## Backend Architecture

The server is built with **Express.js** following a RESTful API pattern:

- **API Design**: REST endpoints organized by resource (habits, goals, health entries, timer sessions)
- **Request Handling**: Express middleware for JSON parsing, logging, and error handling
- **Validation**: Zod schemas shared between client and server for consistent data validation
- **Development Setup**: Custom Vite integration for development mode with HMR support
- **Error Handling**: Centralized error handling middleware with structured error responses

The backend implements an interface-based storage pattern, currently using in-memory storage but designed to easily switch to database implementations.

## Data Storage Solutions

**Database Setup**:
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Migration Management**: Drizzle Kit for schema migrations and database management
- **Connection**: Neon Database serverless connection for cloud PostgreSQL hosting
- **Schema Design**: Normalized relational schema with separate tables for users, habits, habit entries, goals, health entries, and timer sessions

**Current Implementation**: The application includes both in-memory storage (for development) and PostgreSQL integration, with the storage layer abstracted through interfaces for easy switching between implementations.

## Authentication and Authorization

The application currently uses a **default user approach** for simplicity:
- Single default user ID used across all operations
- Session management infrastructure in place (connect-pg-simple for session store)
- Authentication system designed but not fully implemented, allowing for easy future expansion to multi-user support

## External Dependencies

**Core Framework Dependencies**:
- React 18 with TypeScript for type safety
- Express.js for server-side API handling
- Drizzle ORM with PostgreSQL for database operations
- TanStack React Query for data fetching and caching

**UI Component Libraries**:
- Radix UI primitives for accessible component foundations
- Lucide React for consistent iconography
- Embla Carousel for carousel functionality
- React Day Picker for date selection

**Development Tools**:
- Vite for build tooling and development server
- TypeScript for static type checking
- TailwindCSS for styling and responsive design
- Replit-specific plugins for development environment integration

**Database and Infrastructure**:
- Neon Database for serverless PostgreSQL hosting
- connect-pg-simple for PostgreSQL session storage
- date-fns for date manipulation and formatting

The architecture supports real-time features through React Query's built-in refetching mechanisms and is designed for easy scaling with proper separation of concerns between presentation, business logic, and data access layers.