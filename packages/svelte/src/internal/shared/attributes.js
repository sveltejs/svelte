import { escape_html } from '../../escaping.js';
import { clsx as _clsx } from 'clsx';

/**
 * `<div translate={false}>` should be rendered as `<div translate="no">` and _not_
 * `<div translate="false">`, which is equivalent to `<div translate="yes">`. There
 * may be other odd cases that need to be added to this list in future
 * @type {Record<string, Map<any, string>>}
 */
const replacements = {
	translate: new Map([
		[true, 'yes'],
		[false, 'no']
	])
};

/**
 * @template V
 * @param {string} name
 * @param {V} value
 * @param {boolean} [is_boolean]
 * @returns {string}
 */
export function attr(name, value, is_boolean = false) {
	if (value == null || (!value && is_boolean) || (value === '' && name === 'class')) return '';
	const normalized = (name in replacements && replacements[name].get(value)) || value;
	const assignment = is_boolean ? '' : `="${escape_html(normalized, true)}"`;
	return ` ${name}${assignment}`;
}

/**
 * Small wrapper around clsx to preserve Svelte's (weird) handling of falsy values.
 * TODO Svelte 6 revisit this, and likely turn all falsy values into the empty string (what clsx also does)
 * @param  {any} value
 */
export function clsx(value) {
	if (typeof value === 'object') {
		return _clsx(value);
	} else {
		return value ?? '';
	}
}

/**
 * @param {any} clazz
 * @param {string|null} [hash]
 * @param {Record<string,boolean>} [classes]
 * @returns {string|null}
 */
export function to_class(value, hash, classes) {
	let class_name = value == null ? '' : '' + value;
	if (hash) {
		class_name = class_name ? class_name + ' ' + hash : hash;
	}
	if (classes) {
		const white_spaces = ' \t\n\r\f\u00a0\u000b\ufeff';
		for (const key in classes) {
			if (classes[key]) {
				class_name = class_name ? class_name + ' ' + key : key;
			} else if (class_name.length) {
				const len = key.length;
				let start = 0;
				while ((start = class_name.indexOf(key, start)) >= 0) {
					let stop = start + len;
					if (
						white_spaces.indexOf(class_name[start - 1] ?? ' ') >= 0 &&
						white_spaces.indexOf(class_name[stop] ?? ' ') >= 0
					) {
						class_name = (
							class_name.substring(0, start).trim() +
							' ' +
							class_name.substring(stop).trim()
						).trim();
					} else {
						start = stop;
					}
				}
			}
		}
	}
	if (class_name === '') {
		return null;
	}
	return class_name;
}
