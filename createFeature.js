/* eslint-disable no-undef */
// createFeature.js
// Usage: npm run create-feature Friends

const fs = require("fs");
const path = require("path");

const featureName = process.argv[2];
if (!featureName) {
    console.error("❌ Please provide a feature name. Example: npm run create-feature Friends");
    process.exit(1);
}

const baseDir = path.join("src", "features", featureName);
const folders = ["api", "components", "hooks", "screens", "types"];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const writeIfMissing = (filePath, content = "") => {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content, "utf8");
};

if (fs.existsSync(baseDir)) {
    console.error(`⚠️ Feature '${featureName}' already exists at ${baseDir}`);
    process.exit(1);
}

try {
    ensureDir(baseDir);
    folders.forEach((folder) => ensureDir(path.join(baseDir, folder)));

    const commentedExports = folders
        .map((f) => `// export * from "./${f}";`)
        .join("\n");

    const indexContent = `// ${featureName} feature barrel exports
// Uncomment exports as you add entry files (e.g., ${folders[0]}/index.ts)
${commentedExports}

export {}; // keep this a module
`;

    writeIfMissing(path.join(baseDir, "index.ts"), indexContent);

    console.log(`✅ Created feature '${featureName}' at ${baseDir}`);
    console.log(
        folders.map((f) => `  ├── ${f}/`).join("\n") + "\n  └── index.ts (with commented exports)"
    );
} catch (err) {
    console.error("❌ Error creating feature:", err);
    process.exit(1);
}