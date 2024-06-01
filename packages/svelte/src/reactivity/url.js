import { untrack } from '../index-client.js';
import { ReactiveURLSearchParams } from './url-search-params.js';
import { make_reactive } from './utils.js';

// had to create a subclass for URLWithReactiveSearchParams
// because we cannot change the internal `searchParams` reference (which links to the web api implementation) so it requires
// some custom logic
class URLWithReactiveSearchParams extends URL {
	/**
	 * @type {InstanceType<ReactiveURLSearchParams>}
	 */
	#reactive_search_params;

	/**
	 * @type {boolean}
	 */
	#is_in_middle_of_update = false;

	/**
	 * @param {ConstructorParameters<typeof URL>} params
	 */
	constructor(...params) {
		super(...params);
		this.#reactive_search_params = new ReactiveURLSearchParams(super.search);
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
		this.#sync_params_with_url_if_not_blocked();
		return super.search;
	}

	/**
	 * @override
	 */
	set search(value) {
		this.#is_in_middle_of_update = true;
		super.search = value;
		this.#sync_params_with_url('url');
		this.#is_in_middle_of_update = false;
	}

	/**
	 * @override
	 */
	get href() {
		this.searchParams.toString();
		this.#sync_params_with_url_if_not_blocked();
		return super.href;
	}

	/**
	 * @override
	 */
	set href(value) {
		this.#is_in_middle_of_update = true;
		super.href = value;
		this.#sync_params_with_url('url');
		this.#is_in_middle_of_update = false;
	}

	/**
	 * @param {"url" | "search_params"} changed_value
	 */
	#sync_params_with_url(changed_value) {
		untrack(() => {
			if (
				super.search.length === 0
					? this.searchParams.size === 0
					: super.search === `?${this.searchParams}`
			) {
				return;
			}

			if (changed_value == 'url') {
				this.#update_search_params_from_url();
			} else {
				// updating url from params
				this.search = this.searchParams.toString();
			}
		});
	}

	#update_search_params_from_url() {
		// remove keys that don't exist anymore and notify others
		for (const [key, value] of Array.from(this.searchParams.entries())) {
			this.searchParams.delete(key);
		}

		// set or update keys based on the params
		for (const [key, value] of super.searchParams.entries()) {
			this.searchParams.set(key, value);
		}
	}

	#sync_params_with_url_if_not_blocked() {
		if (!this.#is_in_middle_of_update) {
			this.#is_in_middle_of_update = true;
			this.#sync_params_with_url('search_params');
			this.#is_in_middle_of_update = false;
		}
	}

	/**
	 * @override
	 */
	toString() {
		this.searchParams.toString();
		this.#sync_params_with_url_if_not_blocked();
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
		protocol: (options, ...params) => {
			if (options.value.protocol == add_character_if_not_exists(params[0], ':', 'append')) {
				return false;
			}
			options.notify_read_properties(['href', 'origin', 'protocol']);
			return true;
		},
		username: (options, ...params) => {
			if (options.value.username === params[0]) {
				return false;
			}
			options.notify_read_properties(['href', 'username']);
			return true;
		},
		password: (options, ...params) => {
			if (options.value.password === params[0]) {
				return false;
			}
			options.notify_read_properties(['href', 'password']);
			return true;
		},
		hostname: (options, ...params) => {
			if (options.value.hostname === params[0]) {
				return false;
			}
			options.notify_read_properties(['href', 'host', 'hostname']);
			return true;
		},
		port: (options, ...params) => {
			if (options.value.port === params[0]?.toString()) {
				return false;
			}
			options.notify_read_properties(['href', 'origin', 'host', 'port']);
			return true;
		},
		pathname: (options, ...params) => {
			if (options.value.pathname === add_character_if_not_exists(params[0], '/', 'prepend')) {
				return false;
			}
			options.notify_read_properties(['href', 'pathname']);
			return true;
		},
		hash: (options, ...params) => {
			if (options.value.hash === add_character_if_not_exists(params[0], '#', 'prepend')) {
				return false;
			}
			options.notify_read_properties(['href', 'hash']);
			return true;
		},
		search: (options, ...params) => {
			if (options.value.search === add_character_if_not_exists(params[0], '?', 'prepend')) {
				return false;
			}
			options.notify_read_properties(['href', 'search']);
			return true;
		},
		href: (options, ...params) => {
			if (options.value.href === params[0]) {
				return false;
			}
			const new_url = new URL(options.value);
			new_url.href = /**@type {string}*/ (params[0]);
			if (new_url.origin !== options.value.origin) {
				options.notify_read_properties(['origin']);
			}
			if (new_url.host !== options.value.host) {
				options.notify_read_properties(['host']);
			}
			if (new_url.hash !== options.value.hash) {
				options.notify_read_properties(['hash']);
			}
			if (new_url.pathname !== options.value.pathname) {
				options.notify_read_properties(['pathname']);
			}
			if (new_url.protocol !== options.value.protocol) {
				options.notify_read_properties(['protocol']);
			}
			if (new_url.href !== options.value.href) {
				options.notify_read_properties(['href']);
			}
			return true;
		}
	}
});
