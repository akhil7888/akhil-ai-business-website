# System Architecture

## Overview

Akhil AI Business Website follows a modern full-stack architecture using Next.js, Supabase, PostgreSQL, and Vercel.

The application is divided into three main layers:

- Frontend Layer
- Backend & Database Layer
- Deployment Layer


## Architecture Flow

Customer
|
↓
Next.js Frontend Application
|
↓
Supabase Backend Services
|
↓
PostgreSQL Database
|
↓
Admin Dashboard



## Frontend Layer

Technology:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS


Responsibilities:

- Display business website
- Collect customer enquiries
- Provide AI assistant interface
- Handle user interactions
- Communicate with backend services


## Backend & Database Layer

Technology:

- Supabase
- PostgreSQL
- Supabase Authentication


Responsibilities:

- Store customer enquiry data
- Manage authentication
- Provide secure database access
- Handle backend communication


## Admin Dashboard Flow

Admin workflow:

1. Admin logs into dashboard
2. Authentication verifies user
3. Customer enquiries are retrieved
4. Admin reviews and updates enquiry status
5. Changes are stored in database


## Security Architecture

Security features:

- Supabase Authentication
- Row Level Security (RLS)
- Protected admin routes
- Environment variable protection


## Deployment Architecture

Developer
|
↓
GitHub Repository
|
↓
Vercel Deployment
|
↓
Production Website



## Future Architecture Improvements

Future versions can include:

- LLM powered chatbot
- RAG based AI assistant
- Analytics system
- Automated notifications
- AI service recommendations