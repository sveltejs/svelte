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
 * Format a CSS key/value
 * @param {[string,any]} value
 * @returns {string|null}
 */
function cssx_format([k, v]) {
	if (v == null) {
		return null;
	}
	v = ('' + v).trim();
	if (v === '') {
		return null;
	}
	if (k[0] !== '-' && k[1] !== '-') {
		k = k
			.replaceAll('_', '-')
			.replaceAll(/(?<=[a-z])[A-Z](?=[a-z])/g, (c) => '-' + c)
			.toLowerCase();
	}
	return k + ':' + v;
}

/**
 * Build a style attributes based on arrays/objects/strings
 * @param  {any} value
 * @returns {string|null}
 */
export function cssx(value) {
	if (value == null) {
		return null;
	}
	if (typeof value === 'object') {
		if (value instanceof CSSStyleDeclaration) {
			// Special case for CSSStyleDeclaration
			return value.cssText;
		}
		return (Array.isArray(value) ? value.map(cssx) : Object.entries(value).map(cssx_format))
			.filter((v) => v)
			.join(';');
	}
	return value;
}
