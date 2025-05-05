import {mountUI} from './runtime.svelte.js';
import { configureSvelte } from './configure.svelte.js';
import { svelte_inspector } from './tools/inspector/index.js';
export * from './configure.svelte.js';


configureSvelte({tools:[svelte_inspector]});
mountUI();
