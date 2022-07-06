// This script generates the TypeScript definitions

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

execSync('tsc -p src/compiler --emitDeclarationOnly && tsc -p src/runtime --emitDeclarationOnly');

// We need to add these types to the .d.ts files here because if we add them before building, the build will fail,
// because the TS->JS transformation doesn't know these exports are types and produces code that fails at runtime.
// We can't use `export type` syntax either because the TS version we're on doesn't have this feature yet.

function modify(path, modifyFn) {
    const content = readFileSync(path, 'utf8');
    writeFileSync(path, modifyFn(content));
}

modify(
    'types/runtime/index.d.ts',
    content => content.replace('SvelteComponentTyped', 'SvelteComponentTyped, ComponentType, ComponentConstructorOptions, ComponentProps')
);
modify(
    'types/compiler/index.d.ts',
    content => content + '\nexport { CompileOptions, ModuleFormat, EnableSourcemap, CssHashGetter } from "./interfaces"'
);
