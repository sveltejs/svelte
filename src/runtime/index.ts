import './ambient';

export {
	onMount,
	onDestroy,
	beforeUpdate,
	afterUpdate,
	setContext,
	getContext,
	hasContext,
	tick,
	createEventDispatcher,
	SvelteComponentDev as SvelteComponent,
	SvelteComponentTyped
} from 'svelte/internal';
