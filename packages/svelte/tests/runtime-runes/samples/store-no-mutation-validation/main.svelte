<script>
	import { writable } from 'svelte/store';

	let store1 = writable('store');
	let store2 = {
		subscribe: (cb) => {
			cb('...');
			cb('Hello');
			return () => {};
		}
	};

	// store signal is updated during reading this, which normally errors, but shouldn't for stores
	let name = $derived($store1);
	let hello = $derived($store2);
</script>

<h1>{hello} {name}</h1>
