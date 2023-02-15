import { writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';

export const searching = writable(false);
export const query = writable('');

/** @type {import('svelte/store').Writable<any[]>} */
export const recent = persisted('recent_searches', []);
