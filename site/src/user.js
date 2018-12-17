import { writable } from 'svelte/store.js';

export const user = writable(null);

export function logout() {
	user.set(null);
}