<svelte:options runes />
<script>
	import { writable } from "svelte/store";
	import Child from "./child.svelte";
	const state = writable(0);
</script>

<Child {state} />