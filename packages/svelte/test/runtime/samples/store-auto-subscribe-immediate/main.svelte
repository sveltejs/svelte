<script>
	import { writable } from 'svelte/store';
	let foo = writable(42);
	export let initial_foo = $foo;
</script>

<p>{initial_foo}</p>