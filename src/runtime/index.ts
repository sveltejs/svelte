import './ambient.ts';

export {
	onMount,
	onDestroy,
	beforeUpdate,
	afterUpdate,
	setContext,
	getContext,
	tick,
	createEventDispatcher,
	SvelteComponentDev as SvelteComponent
} from './internal/index.ts';
