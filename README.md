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

## App Info Modal Usage

`ModalProvider` exposes modal controls through `useModal()`:

- `openInfo({ title, description? })`
- `openReminderMessageSheet({ taskName, taskText, onSend, initialMessage? })`

### 1. Provider wiring (already in app root)

`ModalProvider` is already wrapped in `src/App.tsx` under `BottomSheetModalProvider`, so any screen/component in the app tree can use it.

### 2. Use it in a component

```tsx
import { useModal } from '@shared/components/ModalProvider';

function ExampleCard() {
  const { openInfo } = useModal();

  return (
    <Button
      title="How this works"
      onPress={() =>
        openInfo({
          title: 'How decision insights work',
          description:
            'This shows which option your helpers are leaning toward. A strong signal appears when one option clearly stands out.',
        })
      }
    />
  );
}
```

### 3. Behavior

- The sheet opens at `45%` height.
- Users can close by swiping down or tapping the backdrop.
- `title` is required.
- `description` is optional.

### 4. Common error

If you see `useModal must be used inside ModalProvider`, the component using modal hooks is rendered outside the provider tree.

## Development Setup

This repository is Bun-only for package installs.

```bash
bun install
cd ios && pod install && cd ..
bun run start
npx react-native run-ios
```

## Environment

The app uses `react-native-config` and loads env files per build type:

- `.env.dev` for debug/dev runs
- `.env.prod` for release builds

Common variables:

- `BASE_URL`: default API base URL
- `BASE_URL_IOS`: iOS override
- `BASE_URL_ANDROID`: Android override
- `GOOGLE_SENDER_ID`: FCM sender ID
- `APP_ENV`: `development` or `production` (drives dev badge + display name)

## Notifications

Supported notification types (from `NotificationDTO.type`):

- `follow`
- `comment`
- `task`
- `task-helper`
- `reminder`
- `decision-done`
- `advice`
- `motivation`
- `decision`
- `remainder` (legacy/typo)

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
- `ios-multi`: build once and launch on all booted iOS simulators
- `create-feature`: generate a feature scaffold (`scripts/createFeature.js`)
- `create-sharedComponent`: generate a shared component (`scripts/createSharedComponent.js`)

Examples:

```bash
bun run ios
bun run android
bun run lint
bun run format
bun run create-feature
bun run create-sharedComponent
bun run ios-multi
```
