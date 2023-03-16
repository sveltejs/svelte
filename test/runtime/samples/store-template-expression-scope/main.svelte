<script>
	import { writable } from 'svelte/store';
	const store = writable();
</script>

<button
	on:click={(store) => {
		$store = Math.random();
	}} />
