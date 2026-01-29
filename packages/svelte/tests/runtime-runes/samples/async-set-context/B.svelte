<script lang="ts">
	import { setContext } from "svelte";
	import C from "./C.svelte";

	let { recipient } = $props();

	// svelte-ignore state_referenced_locally
	setContext("recipient", recipient);
	await Promise.resolve();
</script>

<C />
