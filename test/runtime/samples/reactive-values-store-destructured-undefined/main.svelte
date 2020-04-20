<script>
	import { writable } from 'svelte/store';
	const store = writable([]);
	$: ({ foo1 } = $store);
	$: [foo2] = $store;
</script>

<p>{foo1}</p>
<p>{foo2}</p>
