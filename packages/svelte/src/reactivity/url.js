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
		this.#sync_params_with_url('search_params');
		return super.search;
	}

	/**
	 * @override
	 */
	set search(value) {
		super.search = value;
		this.#sync_params_with_url('url');
	}

	/**
	 * @override
	 */
	get href() {
		this.searchParams.toString();
		this.#sync_params_with_url('search_params');
		return super.href;
	}

	/**
	 * @override
	 */
	set href(value) {
		super.href = value;
		this.#sync_params_with_url('url');
	}

	/**
	 * @param {"url" | "search_params"} changed_value
	 */
	#sync_params_with_url(changed_value) {
		if (super.searchParams.toString() === this.searchParams.toString()) {
			return;
		}

		if (changed_value == 'url') {
			this.#update_search_params_from_url();
		} else {
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
		this.#sync_params_with_url('search_params');
		return super.toString();
	}
}

/**
 * @param {unknown} value
 * @param {string} character
 * @param {"append" | "prepend"} mode
 * @returns {unknown}
 */
function add_character_if_not_exists(value, character, mode) {
	if (!value || typeof value !== 'string') {
		return value;
	}

	if (mode == 'append') {
		return value.endsWith(character) ? value : `${value}${character}`;
	}

	return value.startsWith(character) ? value : `${character}${value}`;
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
		'origin',
		'searchParams'
	],
	interceptors: {
		protocol: (notify_read_properties, value, property, ...params) => {
			if (value.protocol == add_character_if_not_exists(params[0], ':', 'append')) {
				return false;
			}
			notify_read_properties(['href', 'origin', 'protocol']);
			return true;
		},
		username: (notify_read_properties, value, property, ...params) => {
			if (value.username === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'username']);
			return true;
		},
		password: (notify_read_properties, value, property, ...params) => {
			if (value.password === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'password']);
			return true;
		},
		hostname: (notify_read_properties, value, property, ...params) => {
			if (value.hostname === params[0]) {
				return false;
			}
			notify_read_properties(['href', 'host', 'hostname']);
			return true;
		},
		port: (notify_read_properties, value, property, ...params) => {
			if (value.port === params[0]?.toString()) {
				return false;
			}
			notify_read_properties(['href', 'origin', 'host', 'port']);
			return true;
		},

		pathname: (notify_read_properties, value, property, ...params) => {
			if (value.pathname === add_character_if_not_exists(params[0], '/', 'prepend')) {
				return false;
			}
			notify_read_properties(['href', 'pathname']);
			return true;
		},
		hash: (notify_read_properties, value, property, ...params) => {
			if (value.hash === add_character_if_not_exists(params[0], '#', 'prepend')) {
				return false;
			}
			notify_read_properties(['href', 'hash']);
			return true;
		},
		search: (notify_read_properties, value, property, ...params) => {
			if (value.search === add_character_if_not_exists(params[0], '?', 'prepend')) {
				return false;
			}
			notify_read_properties(['href', 'hash', 'search']);
			return true;
		},
		href: (notify_read_properties, value, property, ...params) => {
			if (value.href === params[0]) {
				return false;
			}
			const new_url = new URL(value);
			new_url.href = /**@type {string}*/ (params[0]);
			if (new_url.origin !== value.origin) {
				notify_read_properties(['origin']);
			}
			if (new_url.host !== value.host) {
				notify_read_properties(['host']);
			}
			if (new_url.hash !== value.hash) {
				notify_read_properties(['hash']);
			}
			if (new_url.pathname !== value.pathname) {
				notify_read_properties(['pathname']);
			}
			if (new_url.protocol !== value.protocol) {
				notify_read_properties(['protocol']);
			}
			if (new_url.href !== value.href) {
				notify_read_properties(['href']);
			}
			return true;
		}
	}
});
