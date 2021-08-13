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
	deleteContext,
	tick,
	createEventDispatcher,
	SvelteComponentDev as SvelteComponent,
	SvelteComponentTyped
} from 'svelte/internal';
