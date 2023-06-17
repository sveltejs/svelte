import './ambient.js';

// Types written in this particular order to work around a dts-buddy bug where it doesn't handle the
// SvelteComponentDev as SvelteComponent alias correctly. If that's fixed, we can remove the
// export type .. from './internal/dev.js' line and do just export * from './index.js' below.

export type { SvelteComponentDev as SvelteComponent } from './internal/dev.js';

export type {
	ComponentConstructorOptions,
	ComponentEvents,
	ComponentProps,
	ComponentType
} from './internal/public.js';

export {
	afterUpdate,
	beforeUpdate,
	createEventDispatcher,
	getAllContexts,
	getContext,
	hasContext,
	onDestroy,
	onMount,
	setContext,
	tick,
	SvelteComponentTyped
} from './index.js';
