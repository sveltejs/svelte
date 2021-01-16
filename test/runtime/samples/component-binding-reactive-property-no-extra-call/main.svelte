<script>
	import Component from "./Component.svelte";

	export let object_updates = 0;

	let arr = [""];
	$: if (arr) object_updates++;
</script>

<Component bind:value={arr[0]} />
