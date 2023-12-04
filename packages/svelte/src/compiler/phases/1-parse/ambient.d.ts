// Silence the acorn typescript errors through this ambient type definition + tsconfig.json path alias
// That way we can omit `"skipLibCheck": true` and catch other errors in our d.ts files
declare module 'acorn-typescript';
