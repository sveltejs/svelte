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
	DispatchOptions,
	SvelteComponentDev as SvelteComponent,
	SvelteComponentTyped
} from 'svelte/internal';
