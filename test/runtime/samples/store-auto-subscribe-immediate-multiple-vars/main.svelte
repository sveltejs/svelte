<script>
	import { writable } from 'svelte/store';
	const foo = writable(42), bar = 'something else';
	export let initial_foo = $foo;
</script>

<p>{initial_foo}</p>