import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

const REPLACE = Symbol();

export class ReactiveURL extends URL {
	#url = {
		protocol: source(super.protocol),
		username: source(super.username),
		password: source(super.password),
		hostname: source(super.hostname),
		port: source(super.port),
		pathname: source(super.pathname),
		hash: source(super.hash)
	};

	#searchParams = new ReactiveURLSearchParams();

	/**
	 * @param {string | URL} url
	 * @param {string | URL} [base]
	 */
	constructor(url, base) {
		url = new URL(url, base);
		super(url);
		this.#searchParams[REPLACE](url.searchParams);
	}

	get hash() {
		return get(this.#url.hash);
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
		return get(this.#url.hostname);
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
		get(this.#url.hash);
		this.#searchParams.toString();
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
		set(this.#url.hash, super.hash);
		this.#searchParams[REPLACE](super.searchParams);
	}

	get password() {
		return get(this.#url.password);
	}

	set password(value) {
		super.password = value;
		set(this.#url.password, super.password);
	}

	get pathname() {
		return get(this.#url.pathname);
	}

	set pathname(value) {
		super.pathname = value;
		set(this.#url.pathname, super.pathname);
	}

	get port() {
		return get(this.#url.port);
	}

	set port(value) {
		super.port = value;
		set(this.#url.port, super.port);
	}

	get protocol() {
		return get(this.#url.protocol);
	}

	set protocol(value) {
		super.protocol = value;
		set(this.#url.protocol, super.protocol);
	}

	get search() {
		const search = this.#searchParams?.toString();
		return search ? `?${search}` : '';
	}

	set search(value) {
		super.search = value;
		this.#searchParams[REPLACE](new URLSearchParams(value.replace(/^\?/, '')));
	}

	get username() {
		return get(this.#url.username);
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
		return this.href;
	}

	toJSON() {
		return this.href;
	}
}

export class ReactiveURLSearchParams extends URLSearchParams {
	#version = source(0);

	#increment_version() {
		set(this.#version, this.#version.v + 1);
	}

	/**
	 * @param {URLSearchParams} params
	 */
	[REPLACE](params) {
		for (const key of [...super.keys()]) {
			super.delete(key);
		}

		for (const [key, value] of params) {
			super.append(key, value);
		}

		this.#increment_version();
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	append(name, value) {
		this.#increment_version();
		return super.append(name, value);
	}

	/**
	 * @param {string} name
	 * @param {string=} value
	 * @returns {void}
	 */
	delete(name, value) {
		this.#increment_version();
		return super.delete(name, value);
	}

	/**
	 * @param {string} name
	 * @returns {string|null}
	 */
	get(name) {
		get(this.#version);
		return super.get(name);
	}

	/**
	 * @param {string} name
	 * @returns {string[]}
	 */
	getAll(name) {
		get(this.#version);
		return super.getAll(name);
	}

	/**
	 * @param {string} name
	 * @param {string=} value
	 * @returns {boolean}
	 */
	has(name, value) {
		get(this.#version);
		return super.has(name, value);
	}

	keys() {
		get(this.#version);
		return super.keys();
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	set(name, value) {
		this.#increment_version();
		return super.set(name, value);
	}

	sort() {
		this.#increment_version();
		return super.sort();
	}

	toString() {
		get(this.#version);
		return super.toString();
	}

	values() {
		get(this.#version);
		return super.values();
	}

	entries() {
		get(this.#version);
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		get(this.#version);
		return super.size;
	}
}
