/* eslint-disable no-undef */
// createFeature.js
// Usage: bun run create-feature Feed

const fs = require("fs");
const path = require("path");

const featureName = process.argv[2];
if (!featureName) {
    console.error("❌ Please provide a feature name. Example: bun run create-feature Feed");
    process.exit(1);
}

// Folder name as provided (Feed)
const folderName = featureName;

// Component + hook + API function PascalCase
const componentName = featureName;

// lowercase file base (feed)
const fileBase = featureName.charAt(0).toLowerCase() + featureName.slice(1);

// Paths
const baseDir = path.join("src", "features", folderName);
const folders = ["api", "components", "hooks", "screens", "types"];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const writeFile = (filePath, content) => fs.writeFileSync(filePath, content, "utf8");

// If feature exists — stop
if (fs.existsSync(baseDir)) {
    console.error(`⚠️ Feature '${folderName}' already exists at ${baseDir}`);
    process.exit(1);
}

// ---------------------
// Templates
// ---------------------

// Screen Template
const screenTemplate = `
import React from "react";
import { View, StyleSheet } from "react-native";
import TextElement from "@shared/components/TextElement/TextElement";

export default function ${componentName}Screen() {
  return (
    <View style={styles.container}>
      <TextElement>${componentName} Screen</TextElement>
      <TextElement>This is the starting point for the ${componentName} feature.</TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
`;

// Hook Template
const hookTemplate = `
import { useQuery } from "@tanstack/react-query";
import { get${componentName} } from "../api/get${componentName}.api";

export function use${componentName}() {
  return useQuery({
    queryKey: ["${folderName}"],
    queryFn: get${componentName},
  });
}
`;

// API Template
const apiTemplate = `
export async function get${componentName}() {
  // TODO: replace with actual API request
  return { success: true, message: "Fetched ${componentName} successfully." };
}
`;

// Types Template
const typeTemplate = `
export interface ${componentName}Data {
  id: string;
  createdAt: string;
}
`;

// Barrel File Template
const indexBarrelTemplate = `
// ${componentName} feature exports

export * from "./screens/${componentName}Screen";
export * from "./hooks/use${componentName}";
export * from "./api/get${componentName}.api";
export * from "./types/${fileBase}.types";
`;

try {
    // Create folders
    ensureDir(baseDir);
    folders.forEach((folder) => ensureDir(path.join(baseDir, folder)));

    // Create files
    writeFile(path.join(baseDir, "screens", `${componentName}Screen.tsx`), screenTemplate.trim());
    writeFile(path.join(baseDir, "hooks", `use${componentName}.ts`), hookTemplate.trim());
    writeFile(path.join(baseDir, "api", `get${componentName}.api.ts`), apiTemplate.trim());
    writeFile(path.join(baseDir, "types", `${fileBase}.types.ts`), typeTemplate.trim());
    writeFile(path.join(baseDir, "index.ts"), indexBarrelTemplate.trim());

    // Log output
    console.log(`\n✅ Created feature '${folderName}' with starter code at ${baseDir}\n`);
    console.log(`
📂 Structure Generated:
  src/features/${folderName}/
    ├── api/
    │     └── get${componentName}.api.ts   ← ✔ CORRECT FORMAT
    ├── components/
    ├── hooks/
    │     └── use${componentName}.ts
    ├── screens/
    │     └── ${componentName}Screen.tsx
    ├── types/
    │     └── ${fileBase}.types.ts         ← ✔ lowercase
    └── index.ts
  `);
} catch (err) {
    console.error("❌ Error creating feature:", err);
    process.exit(1);
}
