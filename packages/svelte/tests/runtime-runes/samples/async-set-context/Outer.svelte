<script lang="ts">
	import { setContext } from "svelte";
	import Inner from "./Inner.svelte";

	setContext("greeting", "hi");
	await Promise.resolve();
</script>

<Inner />
