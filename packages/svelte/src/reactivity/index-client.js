export { SvelteDate } from './date.js';
export { SvelteSet } from './set.js';
export { SvelteMap } from './map.js';
export { SvelteURL, SvelteURLSearchParams } from './url.js';

/** @deprecated Use `SvelteDate` instead */
export function Date() {
	throw new Error('Date has been removed, use SvelteDate instead.');
}

/** @deprecated Use `SvelteSet` instead */
export function Set() {
	throw new Error('Set has been removed, use SvelteSet instead.');
}

/** @deprecated Use `SvelteMap` instead */
export function Map() {
	throw new Error('Map has been removed, use SvelteMap instead.');
}

/** @deprecated Use `SvelteURL` instead */
export function URL() {
	throw new Error('URL has been removed, use SvelteURL instead.');
}

/** @deprecated Use `SvelteURLSearchParams` instead */
export function URLSearchParams() {
	throw new Error('URLSearchParams has been removed, use SvelteURLSearchParams instead.');
}
