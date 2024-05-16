import { writable } from 'svelte/store';

export const flavours = writable([]);

flavours.subscribe(console.log)