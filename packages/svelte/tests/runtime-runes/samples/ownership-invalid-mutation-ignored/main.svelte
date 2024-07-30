<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';
	let test = $state({ test: 'a' });

	const store = writable(test);
</script>

<Child {test} {store} />
