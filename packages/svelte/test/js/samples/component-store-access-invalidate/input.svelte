<script>
	import { writable } from 'svelte/store';
	const foo = writable(0);
</script>

<h1>{$foo}</h1>