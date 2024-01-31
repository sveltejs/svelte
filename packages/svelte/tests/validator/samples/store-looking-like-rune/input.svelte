<script>
	import { writable } from 'svelte/store';

	export let initial;
	const state = writable(initial);
</script>

<div>{$state}</div>
