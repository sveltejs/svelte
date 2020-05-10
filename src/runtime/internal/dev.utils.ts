import { SvelteComponent } from './Component';
import { now, has_Symbol } from './environment';
import { dev$assert } from './dev.tools';

export const dev$is_array_like = (arg) =>
	dev$assert(
		typeof arg === 'string' || (typeof arg === 'object' && 'length' in arg),
		`{#each} only iterates over Array-like Objects.${
			has_Symbol && Symbol.iterator in arg
				? ' Consider using a [...spread] to convert this iterable into an Array instead.'
				: ''
		}`
	);

export const dev$known_slots = (name, slot, keys) =>
	Object.keys(slot).forEach((key) => dev$assert(keys.includes(key), `<${name}> received an unexpected slot "${key}".`));

export const dev$is_valid_store = (store, name) =>
	dev$assert(
		typeof store === 'object' && (store === null || typeof store.subscribe === 'function'),
		`Could not subscribe to $${name}. A valid store is an object with a .subscribe method, consider setting ${name} to null if this is expected.`
	);

export function dev$loop_guard(loopGuardTimeout) {
	const start = now();
	return () => dev$assert(now() - start < loopGuardTimeout, `Infinite loop detected`);
}
type Props = Record<string, any>;
export interface SvelteComponentDev {
	$set(props?: Props): void;
	$on<T = any>(event: string, callback: (event: CustomEvent<T>) => void): () => void;
	$destroy(): void;
	[accessor: string]: any;
}

export class SvelteComponentDev extends SvelteComponent {
	constructor(options: {
		target: Element;
		anchor?: Element;
		props?: Props;
		hydrate?: boolean;
		intro?: boolean;
		$$inline?: boolean;
	}) {
		if (!options || (!options.target && !options.$$inline)) throw new Error(`'target' is a required option`);
		super();
	}
	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn(`Component was already destroyed`); // eslint-disable-line no-console
		};
	}
	$capture_state() {}
	$inject_state() {}
}
