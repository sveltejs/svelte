// This script generates the TypeScript definitions

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

execSync('tsc -p src/compiler --emitDeclarationOnly && tsc -p src/runtime --emitDeclarationOnly');

// We need to add these types to the index.d.ts here because if we add them before building, the build will fail,
// because the TS->JS transformation doesn't know these exports are types and produces code that fails at runtime.
// We can't use `export type` syntax either because the TS version we're on doesn't have this feature yet.
const path = 'types/runtime/index.d.ts';
const content = readFileSync(path, 'utf8');
writeFileSync(path, content.replace('SvelteComponentTyped', 'SvelteComponentTyped, ComponentType, ComponentConstructorOptions, ComponentProps'));
