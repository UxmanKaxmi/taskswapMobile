# Push Me Up (Mobile)

Push Me Up is a social accountability app. People create tasks to be pushed, nudged, or supported by friends — not to track productivity. The focus is emotional support, gentle pressure, and visible social interaction.

## Product Intent

This is not a to‑do list or productivity tracker. It is about people helping people move.

### Task Intent Types

1. Motivation: “I want encouragement”
2. Advice: “I want opinions or suggestions”
3. Decision: “Help me decide between options”
4. Reminder: “Help me not forget”

Each intent type has its own UI and behavior.

## Principles

- Emotional > functional
- Social pressure (positive) > private tracking
- Simple > clever
- MVP first, polish later

## Tech Stack

- Frontend: React Native + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL (Prisma)

## Project Structure

`src/`

- `App.tsx`: app entry and provider wiring
- `features/`: modular, domain-driven features (screens, hooks, APIs, types)
- `navigation/`: navigators and route types
- `shared/`: reusable components, theme, utils, API helpers
- `lib/`: cross-cutting libs (React Query, notifications)
- `assets/`: images and SVGs

## Development Setup

```bash
yarn install
cd ios && pod install && cd ..
yarn start
npx react-native run-ios
```

## Scripts

From `package.json`:

- `android`: run Android app
- `ios`: run iOS app
- `start`: start Metro with cache reset
- `test`: run Jest
- `lint`: run ESLint
- `lint:fix`: run ESLint with autofix
- `format`: run Prettier
- `android-release`: build Android release APK
- `ios-release`: build and deploy iOS release via Xcode build + `ios-deploy`
- `create-feature`: generate a feature scaffold (`scripts/createFeature.js`)
- `create-sharedComponent`: generate a shared component (`scripts/createSharedComponent.js`)
