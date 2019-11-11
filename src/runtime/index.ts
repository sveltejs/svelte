import './ambient';

export {
	onMount,
	onDestroy,
	beforeUpdate,
	afterUpdate,
	setContext,
	getContext,
	tick,
	createEventDispatcher,
	SvelteComponentApi as SvelteComponent
} from 'svelte/internal';
