import { derived, writable } from 'svelte/store';

const a = writable(false);
derived(a, (aVal) => {
	// @ts-expect-error
	aVal === '';
	return aVal === true;
});
derived([a], ([aVal]) => {
	// @ts-expect-error
	aVal === '';
	return aVal === true;
});
