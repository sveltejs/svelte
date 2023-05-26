<script>
	import Component from "./Component.svelte";

	let value = "foo";
</script>

Parent component "{value}"<br />
<Component bind:value />
