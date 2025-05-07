import { mountUI } from './runtime.svelte.js';
import { configureSvelte } from './configure.svelte.js';
import { svelte_inspector } from './tools/inspector/index.js';
import { svelte_config } from './tools/config/index.js';
export * from './configure.svelte.js';

configureSvelte({
	position: 'top-left',
	tools: [svelte_inspector, svelte_config]
});
mountUI();
