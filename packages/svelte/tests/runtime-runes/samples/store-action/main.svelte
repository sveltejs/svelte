<script>
	import { writable } from "svelte/store";
	import { fade } from "svelte/transition";

	const store = writable('Hello');

	const action = (node, text) => {
		node.textContent = text
	}
</script>

<div use:action={$store}>Test</div>
