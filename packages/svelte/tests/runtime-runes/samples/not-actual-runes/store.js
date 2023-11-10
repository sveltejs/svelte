import { writable } from 'svelte/store';

export const state = writable((nr) => nr + 1);
export const effect = writable(() => 0);
