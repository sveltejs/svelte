<script>
	import { writable } from 'svelte/store';
	import { store } from './state.js';

	export let value;

	const copy = writable(value);

	$: {
		copy.set(value);
		store.set({ value });
	}
</script>

<p>{$copy}</p>
