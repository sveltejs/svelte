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
	let store3 = undefined;

	// store signal is updated during reading this, which normally errors, but shouldn't for stores
	let name = $derived($store1);
	let hello = $derived($store2);
	let undefined_value = $derived($store3);
</script>

<h1>{hello} {name} {undefined_value}</h1>
