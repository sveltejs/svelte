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
	SvelteComponentDev as SvelteComponent,
	SvelteComponentTyped,
	SvelteComponentConstructor
} from 'svelte/internal';
