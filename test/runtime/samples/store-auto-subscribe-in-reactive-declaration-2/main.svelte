<script>
	import { writable } from 'svelte/store';
	import Child from './App.svelte';

	const store_container = { store: writable('Hello World') };

	export function update_value(value) {
		store_container.store = writable(value);
	}
</script>

<Child {store_container} />
