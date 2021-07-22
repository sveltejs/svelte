<script>
	import { writable } from 'svelte/store';
	import Child from './App.svelte';

	const storeContainer = { store: writable('Hello World') }

	export function updateValue(value) {
		storeContainer.store = writable(value);
	}
</script>

<Child {storeContainer} />