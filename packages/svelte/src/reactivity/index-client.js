export { SvelteDate } from './date.js';
export { SvelteSet } from './set.js';
export { SvelteMap } from './map.js';
export { SvelteURL, SvelteURLSearchParams } from './url.js';

/** @deprecated Use `SvelteDate` instead */
function DeprecatedDate() {
	throw new Error('Date is deprecated, using SvelteDate instead.');
}

/** @deprecated Use `SvelteSet` instead */
function DeprecatedSet() {
	throw new Error('Set is deprecated, using SvelteSet instead.');
}

/** @deprecated Use `SvelteMap` instead */
function DeprecatedMap() {
	throw new Error('Map is deprecated, using DeprecatedMap instead.');
}

/** @deprecated Use `SvelteURL` instead */
function DeprecatedURL() {
	throw new Error('URL is deprecated, using DeprecatedURL instead.');
}

/** @deprecated Use `SvelteURLSearchParams` instead */
function DeprecatedURLSearchParams() {
	throw new Error('URLSearchParams is deprecated, using SvelteURLSearchParams instead.');
}

// Deprecated
export { DeprecatedDate as Date };
export { DeprecatedSet as Set };
export { DeprecatedMap as Map };
export { DeprecatedURL as URL };
export { DeprecatedURLSearchParams as URLSearchParams };
