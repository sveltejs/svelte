import { source } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { get_current_url } from './url.js';
import { increment } from './utils.js';

export const REPLACE = Symbol();

export class SvelteURLSearchParams extends URLSearchParams {
	#version = source(0);
	#url = get_current_url();

	#updating = false;

	#update_url() {
		if (!this.#url || this.#updating) return;
		this.#updating = true;

		const search = this.toString();
		this.#url.search = search && `?${search}`;

		this.#updating = false;
	}

	/**
	 * @param {URLSearchParams} params
	 */
	[REPLACE](params) {
		if (this.#updating) return;
		this.#updating = true;

		for (const key of [...super.keys()]) {
			super.delete(key);
		}

		for (const [key, value] of params) {
			super.append(key, value);
		}

		increment(this.#version);
		this.#updating = false;
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	append(name, value) {
		super.append(name, value);
		this.#update_url();
		increment(this.#version);
	}

	/**
	 * @param {string} name
	 * @param {string=} value
	 * @returns {void}
	 */
	delete(name, value) {
		var has_value = super.has(name, value);
		super.delete(name, value);
		if (has_value) {
			this.#update_url();
			increment(this.#version);
		}
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
		var previous = super.getAll(name).join('');
		super.set(name, value);
		// can't use has(name, value), because for something like https://svelte.dev?foo=1&bar=2&foo=3
		// if you set `foo` to 1, then foo=3 gets deleted whilst `has("foo", "1")` returns true
		if (previous !== super.getAll(name).join('')) {
			this.#update_url();
			increment(this.#version);
		}
	}

	sort() {
		super.sort();
		this.#update_url();
		increment(this.#version);
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
