<script lang="ts">
	import { writable } from 'svelte/store';
	const store = writable(0);
	
	async function logStore() {
		console.log($store)
		store.set(100);
	}
</script>

<button onclick={logStore}>Click me</button>
