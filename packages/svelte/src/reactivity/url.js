import { untrack } from '../index-client.js';
import { ReactiveURLSearchParams } from './url-search-params.js';
import { make_reactive } from './utils.js';

/**
 * had to create a subclass for URLWithReactiveSearchParams
 * because we cannot change the internal `searchParams` reference (which links to the web api implementation) so it requires
 * some custom logic
 */
class URLWithReactiveSearchParams extends URL {
	/**
	 * @type {InstanceType<ReactiveURLSearchParams>}
	 */
	#reactive_search_params;

	/**
	 * @param {ConstructorParameters<typeof URL>} params
	 */
	constructor(...params) {
		super(...params);

		this.#reactive_search_params = new ReactiveURLSearchParams(super.searchParams);
	}

	/**
	 * @override
	 */
	get searchParams() {
		return this.#reactive_search_params;
	}

	/**
	 * @override
	 */
	get search() {
		this.searchParams.toString();
		this.#sync_params_with_url({ search_params_updated: true });
		return super.search;
	}

	/**
	 * @override
	 */
	set search(value) {
		super.search = value;
		this.#sync_params_with_url({ url_updated: true });
	}

	/**
	 * @override
	 */
	get href() {
		this.searchParams.toString();
		this.#sync_params_with_url({ search_params_updated: true });
		return super.href;
	}

	/**
	 * @override
	 */
	set href(value) {
		super.href = value;
		this.#sync_params_with_url({ url_updated: true });
	}

	/**
	 * @param {{url_updated?: boolean, search_params_updated?: boolean}} param0
	 */
	#sync_params_with_url({ url_updated = false, search_params_updated = false }) {
		if (super.searchParams.toString() === this.searchParams.toString()) {
			return;
		}

		if (url_updated) {
			this.#update_search_params_from_url();
		} else if (search_params_updated) {
			// updating url from params
			this.search = this.searchParams.toString();
		}
	}

	#update_search_params_from_url() {
		/**
		 * keeping track of this is required because we have to keep the order in which they are updated
		 * @type {string[]}
		 */
		const keys_with_no_change = [];

		// remove keys that don't exist anymore and notify others
		for (const [key, value] of Array.from(this.searchParams.entries())) {
			if (!super.searchParams.has(key) || value == super.searchParams.get(key)) {
				keys_with_no_change.push(key);
				untrack(() => {
					this.searchParams.delete(key);
				});
				continue;
			}
			this.searchParams.delete(key);
		}

		// set or update keys based on the params
		for (const [key, value] of super.searchParams.entries()) {
			if (keys_with_no_change.includes(key)) {
				untrack(() => {
					this.searchParams.set(key, value);
				});
				continue;
			}
			this.searchParams.set(key, value);
		}
	}

	/**
	 * @override
	 */
	toString() {
		this.searchParams.toString();
		this.#sync_params_with_url({ search_params_updated: true });
		return super.toString();
	}
}

export const ReactiveURL = make_reactive(URLWithReactiveSearchParams, {
	write_properties: [
		'protocol',
		'username',
		'password',
		'hostname',
		'port',
		'pathname',
		'hash',
		'search',
		'href',
		'host'
	],
	read_properties: [
		'protocol',
		'username',
		'password',
		'hostname',
		'port',
		'pathname',
		'hash',
		'search',
		'href',
		'host',
		'origin'
	],
	interceptors: {
		protocol: (notify_read_properties, value, property, ...params) => {
			if (
				typeof params[0] == 'string' &&
				value.protocol.split(':')[0] === params[0].split(':')[0]
			) {
				return false;
			}
			notify_read_properties(['href', 'origin', 'protocol']);
			return true;
		},
		username: (notify_read_properties, value, property, ...params) => {
			if (value.protocol === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'username']);
			return true;
		},
		password: (notify_read_properties, value, property, ...params) => {
			if (value.protocol === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'password']);
			return true;
		},
		hostname: (notify_read_properties, value, property, ...params) => {
			if (value.protocol === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'host', 'hostname']);
			return true;
		},
		port: (notify_read_properties, value, property, ...params) => {
			if (value.protocol === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'origin', 'host', 'port']);
			return true;
		},

		pathname: (notify_read_properties, value, property, ...params) => {
			if (value.protocol === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'pathname']);
			return true;
		},
		hash: (notify_read_properties, value, property, ...params) => {
			if (value.protocol === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'hash']);
			return true;
		},
		search: (notify_read_properties, value, property, ...params) => {
			if (value.search === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'hash', 'search']);
			return true;
		},
		href: (notify_read_properties, value, property, ...params) => {
			if (value.href === params[0]) {
				return false;
			}
			notify_read_properties(['origin', 'host', 'hash', 'pathname', 'href']);
			return true;
		}
	}
});
