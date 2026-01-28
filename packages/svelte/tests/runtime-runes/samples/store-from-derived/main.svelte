<script>
	import { writable } from 'svelte/store';
	let data = { store: writable(false) };
	let { store } = $derived(data);
</script>

<button onclick={() => ($store = true)}>{$store}</button>
