/**
 *   __DEV__
 * 
 * Used in src/runtime
 * 
 * Bundles dev runtime to svelte/dev/[library].[m]js
 * the compiler rewrites its own 'svelte' imports to 'svelte/dev' automatically
 * 
 */
declare var __DEV__: boolean;
/**
 *   __VERSION__
 * 
 * Svelte's version in package.json         
 * Used in src/compiler and src/runtime
 * 
 */
declare var __VERSION__: string;
/**
 *   __COMPILER_API_VERSION__
 * 
 *  Unique ID passed to the compiler
 *  Used to mitigate breaking changes with bundler plugins
 * 
 *  VERSIONS ( default is "3.0.0" )
 * 
 *      >3.22.0 : { 
 * 
 *          The change :
 *              A different runtime is now used in dev mode, 
 *              every import has to go through 'svelte/dev' instead of 'svelte'
 * 
 *          Requirement :
 *              In dev mode, bundler plugins must make sure that every 'svelte' import is replaced by 'svelte/dev'
 * 
 *      }
 * 
 */
//declare var __COMPILER_API_VERSION__: boolean;
/**
 * Unique ID devtools must pass to the compiler
 * Used to 
 * 
 * VERSIONS ( default is "^3.21.0" )
 * - 0 (default) : compiler imports from prod runtime
 * - 1 : in dev mode, compiler imports from dev runtime
 */
//declare var __DEVTOOLS_API_VERSION__: boolean;

/**
 * TODO
 * Bundle different runtime for tests 
 * instead of relying on hacks
 */
declare var __TEST__: boolean;