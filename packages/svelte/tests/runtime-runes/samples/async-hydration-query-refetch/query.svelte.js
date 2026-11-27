import { tick, untrack } from 'svelte';

/** Like SvelteKit's `page.params`, set right before hydrating */
export const params = $state({});

/** Unrelated app state */
export const other = $state({ n: 0 });

/** Something slow on the client, so that hydration stays pending for a while */
export const slow = Promise.withResolvers();

/** The arguments the query was requested with */
export const requests = [];

/** What the server rendered, like SvelteKit's `query_responses` */
const seeded = new Map([['ada', { name: 'ada' }]]);

/**
 * A minimal model of SvelteKit's remote `query` (`Query` in `instance.svelte.js`): one instance per
 * argument, seeded with what the server rendered, which starts lazily — `#then` writes `#promise`
 */
class Query {
	#id;
	#ready = $state(false);
	#raw = $state.raw();
	/** @type {Promise<void> | null} */
	#promise = $state.raw(null);

	#current = $derived.by(() => (this.#ready ? this.#raw : undefined));

	#then = $derived.by(() => {
		const p = this.#get_promise();

		return (/** @type {any} */ resolve, /** @type {any} */ reject) =>
			p.then(() => this.#current).then(resolve, reject);
	});

	/** @param {string} id */
	constructor(id) {
		this.#id = id;

		if (seeded.has(id)) {
			this.#ready = true;
			this.#raw = seeded.get(id);
			this.#promise = Promise.resolve();
		}
	}

	#get_promise() {
		untrack(() => (this.#promise ??= this.#run()));
		return /** @type {Promise<void>} */ (this.#promise);
	}

	#run() {
		requests.push(this.#id);

		return Promise.resolve().then(() => {
			untrack(() => {
				this.#raw = { name: String(this.#id) };
				this.#ready = true;
			});
		});
	}

	get then() {
		void tick().then(() => this.#get_promise());
		return this.#then;
	}
}

/** @type {Map<string, Query>} */
const cache = new Map();

/** @param {string} id */
export function get_user(id) {
	let query = cache.get(id);

	if (!query) {
		// (like SvelteKit's `CacheController#ensure_entry`)
		$effect.root(() => {
			query = new Query(id);
		});

		query ??= new Query(id); // (`$effect.root` doesn't run on the server)
		cache.set(id, query);
	}

	return /** @type {Query} */ (query);
}
