import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

const UPDATE = Symbol('UPDATE');
const VERSION = Symbol('version');

export class ReactiveURL extends URL {
	#url = {
		protocol: source(super.protocol),
		username: source(super.username),
		password: source(super.password),
		hostname: source(super.hostname),
		port: source(super.port),
		pathname: source(super.pathname),
		search: source(super.search),
		hash: source(super.hash)
	};
	#searchParams = new ReactiveURLSearchParams(super.searchParams, this.#url.search);

	get hash() {
		get(this.#url.hash);
		return super.hash;
	}

	set hash(value) {
		super.hash = value;
		set(this.#url.hash, super.hash);
	}

	get host() {
		get(this.#url.hostname);
		get(this.#url.port);
		return super.host;
	}

	set host(value) {
		super.host = value;
		set(this.#url.hostname, super.hostname);
		set(this.#url.port, super.port);
	}

	get hostname() {
		get(this.#url.hostname);
		return super.hostname;
	}

	set hostname(value) {
		super.hostname = value;
		set(this.#url.hostname, super.hostname);
	}

	get href() {
		get(this.#url.protocol);
		get(this.#url.username);
		get(this.#url.password);
		get(this.#url.hostname);
		get(this.#url.port);
		get(this.#url.pathname);
		get(this.#url.search);
		get(this.#url.hash);
		return super.href;
	}

	set href(value) {
		super.href = value;
		set(this.#url.protocol, super.protocol);
		set(this.#url.username, super.username);
		set(this.#url.password, super.password);
		set(this.#url.hostname, super.hostname);
		set(this.#url.port, super.port);
		set(this.#url.pathname, super.pathname);
		set(this.#url.search, super.search);
		set(this.#url.hash, super.hash);
		this.#searchParams[UPDATE](super.searchParams);
	}

	get password() {
		get(this.#url.password);
		return super.password;
	}

	set password(value) {
		super.password = value;
		set(this.#url.password, super.password);
	}

	get pathname() {
		get(this.#url.pathname);
		return super.pathname;
	}

	set pathname(value) {
		super.pathname = value;
		set(this.#url.pathname, super.pathname);
	}

	get port() {
		get(this.#url.port);
		return super.port;
	}

	set port(value) {
		super.port = value;
		set(this.#url.port, super.port);
	}

	get protocol() {
		get(this.#url.protocol);
		return super.protocol;
	}

	set protocol(value) {
		super.protocol = value;
		set(this.#url.protocol, super.protocol);
	}

	get search() {
		get(this.#url.search);
		get(this.#searchParams[VERSION]);
		return super.search;
	}

	set search(value) {
		super.search = value;
		set(this.#url.search, super.search);
		this.#searchParams[UPDATE](super.searchParams);
	}

	get username() {
		get(this.#url.username);
		return super.username;
	}

	set username(value) {
		super.username = value;
		set(this.#url.username, super.username);
	}

	get origin() {
		get(this.#url.protocol);
		get(this.#url.hostname);
		get(this.#url.port);
		return super.origin;
	}

	get searchParams() {
		return this.#searchParams;
	}

	toString() {
		this.href;
		return super.toString();
	}

	toJSON() {
		this.href;
		return super.toJSON();
	}

	/**
	 * @param {string} input
	 * @param {string=} base
	 */
	constructor(input, base) {
		super(input, base);
	}
}

export class ReactiveURLSearchParams extends URLSearchParams {
	#url_search_params;
	#search;
	#version = source(0);
	[VERSION] = this.#version;

	#increment_version() {
		set(this.#version, this.#version.v + 1);
	}
	#update_search() {
		set(this.#search, '?' + this.#url_search_params.toString());
	}

	/**
	 *
	 * @param {URLSearchParams} value
	 */
	[UPDATE](value) {
		this.#url_search_params = value;
		this.#increment_version();
	}
	/**
	 *
	 * @param {URLSearchParams} url_search_params
	 * @param {import('../internal/client/reactivity/types.js').Source<string>} search
	 */
	constructor(url_search_params, search) {
		super();
		this.#url_search_params = url_search_params;
		this.#search = search;
	}

	/**
	 *
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	append(name, value) {
		this.#increment_version();
		this.#update_search();
		return this.#url_search_params.append(name, value);
	}
	/**
	 *
	 * @param {string} name
	 * @param {string=} value
	 * @returns {void}
	 */
	delete(name, value) {
		this.#increment_version();
		this.#update_search();
		return this.#url_search_params.delete(name, value);
	}
	/**
	 *
	 * @param {string} name
	 * @returns {string|null}
	 */
	get(name) {
		get(this.#version);
		return this.#url_search_params.get(name);
	}
	/**
	 *
	 * @param {string} name
	 * @returns {string[]}
	 */
	getAll(name) {
		get(this.#version);
		return this.#url_search_params.getAll(name);
	}
	/**
	 *
	 * @param {string} name
	 * @param {string=} value
	 * @returns {boolean}
	 */
	has(name, value) {
		get(this.#version);
		return this.#url_search_params.has(name, value);
	}
	keys() {
		get(this.#version);
		return this.#url_search_params.keys();
	}
	/**
	 *
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	set(name, value) {
		this.#increment_version();
		this.#update_search();
		return this.#url_search_params.set(name, value);
	}
	sort() {
		this.#increment_version();
		this.#update_search();
		return this.#url_search_params.sort();
	}
	toString() {
		get(this.#version);
		return this.#url_search_params.toString();
	}
	values() {
		get(this.#version);
		return this.#url_search_params.values();
	}
	entries() {
		get(this.#version);
		return this.#url_search_params.entries();
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	get size() {
		return this.#url_search_params.size;
	}
}
