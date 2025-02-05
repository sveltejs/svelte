<script>
	import { writable, fromStore, toStore } from "svelte/store";

	const store = writable("previous");
	let text = $derived(fromStore(store).current + " message");

	text; // read derived in a non-tracking context
</script>

<o>Store: {$store}</o>
<p>Text: {text}</p>
<button onclick={() => { store.set("new"); }}>Change Store</button>
