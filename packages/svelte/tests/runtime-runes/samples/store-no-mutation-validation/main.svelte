<script> 
	import { writable } from "svelte/store";
	let store = writable('store');
	let name = $derived($store); // store signal is updated during reading this, which normally errors, but shouldn't for stores
</script>

<h1>Hello {name}</h1>
