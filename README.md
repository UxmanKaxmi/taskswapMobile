# TaskSwap Mobile

A modern, scalable React Native app built with custom theming, TypeScript, and reusable architecture inspired by Bulletproof React.

---

## 🧩 Major Packages Used

### 🛠 Core Stack

| Package        | Purpose                        |
| -------------- | ------------------------------ |
| `react-native` | Core mobile framework          |
| `react`        | UI library                     |
| `typescript`   | Type safety across the project |

---

### 📦 Dev & Tooling

| Package                        | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `eslint` / `prettier`          | Code linting and formatting                              |
| `metro-config`                 | Custom Metro bundler config for aliasing and SVG support |
| `babel-plugin-module-resolver` | Alias support for `@app`, `@features`, etc.              |
| `@react-native/metro-config`   | Extended config for Metro bundler                        |
| `react-native-svg-transformer` | Enables importing `.svg` files as React components       |

---

### 🎨 UI & Theming

| Package                     | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `react-native-size-matters` | Responsive scaling for padding, font sizes, etc.             |
| `@shared/theme`             | Custom theme system with spacing, colors, typography         |
| `@shared/components`        | Reusable UI components like `Button`, `Icon`, `Layout`, etc. |

---

### 🌈 Icons

| Package                     | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `react-native-vector-icons` | FontAwesome6 icons and other sets                           |
| `FontAwesome6`              | Used with custom wrapper for themed icons with autocomplete |

---

### 🔐 Auth & APIs

| Package    | Purpose                                                          |
| ---------- | ---------------------------------------------------------------- |
| `axios`    | For networking/API requests                                      |
| `firebase` | (planned or used) for social authentication (e.g., Google login) |

---

### ⚙️ Project Structure

src/
├── app/ # Entry-level navigation & screens
├── features/ # Modular domain features (e.g., tasks)
├── shared/
│ ├── components/ # Reusable UI components
│ ├── theme/ # Theme system (colors, spacing, typography)
│ └── icons/ # Centralized icon config/types

---

## 🚀 Development Setup

```bash
yarn install
cd ios && pod install && cd ..
yarn start
npx react-native run-ios
```

<!-- IMPORTANT -->
<!-- export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH" source /Users/usmankazmi/.zshrc -->
