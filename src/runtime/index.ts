import './ambient';

export {
	onMount,
	onDestroy,
	beforeUpdate,
	afterUpdate,
	setContext,
	getContext,
	getAllContexts,
	hasContext,
	tick,
	createEventDispatcher,
	onEventListener,
	SvelteComponentDev as SvelteComponent,
	SvelteComponentTyped
	// additional exports added through generate-type-definitions.js
} from 'svelte/internal';
