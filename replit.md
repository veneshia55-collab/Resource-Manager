# LiBu (리버) - AI Media Literacy Learning App

## Overview

LiBu is an AI-powered educational companion designed to help Korean middle and high school students develop critical media literacy skills. The app provides guided conversations and structured learning activities across six learning modules: vocabulary support, factual/summary comprehension, inferential understanding, critical thinking, integrated understanding, and information verification.

The application is built as a cross-platform mobile app using Expo/React Native with a Node.js/Express backend, leveraging OpenAI APIs for AI-powered analysis and web search integration for evidence-based responses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation v7 with native stack and bottom tabs
  - Root stack navigator handles modals and module screens
  - Main tab navigator with 5 tabs: Learn, Practice, Report, Library, Profile
- **State Management**: 
  - React Context for global content state (ContentContext)
  - TanStack Query for server state and API caching
  - AsyncStorage for local persistence of learning records and content
- **UI Components**: Custom themed components with Reanimated animations
  - Design follows "soft editorial" aesthetic with generous whitespace
  - Supports automatic light/dark theme switching
- **Path Aliases**: `@/` maps to `./client`, `@shared/` maps to `./shared`

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Structure**: RESTful endpoints under `/api/`
- **AI Integration**: OpenAI API via Replit AI Integrations
  - Supports text completions, image generation, and audio processing
  - Includes batch processing utilities with rate limiting and retries
- **CORS**: Dynamic origin handling for Replit dev/deployment domains

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
  - Schema defined in `shared/schema.ts`
  - Migrations managed via `drizzle-kit`
- **Client-side Storage**: AsyncStorage for:
  - Active learning content
  - Learning records per module
  - Saved library items
- **In-memory Storage**: MemStorage class for user data (server/storage.ts)

### Learning Module Structure
Each of the 6 learning modules follows a consistent pattern:
1. Content input → AI analysis with web search → Evidence-based response → Record saved
2. Results include: Source cards, evidence summary, LiBu response, reference links
3. Report tab aggregates all records without new AI generation

### Key Design Decisions
- **Search-first responses**: All learning modules (A-F) perform information search before generating responses, using evidence-based reasoning
- **Offline fallback**: Template/rule-based responses when external search fails
- **Progressive disclosure**: Complexity unfolds gradually through dialogue to avoid overwhelming students
- **Cross-platform support**: Single codebase for iOS, Android, and web via Expo

## External Dependencies

### AI & Machine Learning
- **OpenAI API** (via Replit AI Integrations): Text completions, audio processing, image generation
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Database
- **PostgreSQL**: Primary database for persistent data
  - Environment variable: `DATABASE_URL`
- **Drizzle ORM**: Type-safe database queries and schema management

### Core Expo/React Native Libraries
- `expo-blur`, `expo-haptics`, `expo-image`: Native UI enhancements
- `react-native-reanimated`: Gesture and animation support
- `react-native-keyboard-controller`: Keyboard-aware layouts
- `@react-navigation/*`: Navigation infrastructure

### Third-Party Services
- **DuckDuckGo Search** (planned): Web search for evidence gathering
- **Wikipedia API** (planned): Fallback knowledge source

### Development Tools
- `drizzle-kit`: Database migrations
- `tsx`: TypeScript execution for server
- `esbuild`: Production server bundling