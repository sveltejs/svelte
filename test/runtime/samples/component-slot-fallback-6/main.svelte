<script>
	import Inner from "./Inner.svelte";
	let value = '';
</script>

<input bind:value />

<Inner {value} />
