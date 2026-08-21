<script>
	import Component from "./Component.svelte";

	let C = $state(null);
</script>

<button onclick={() => C = Component}>show</button>

<C />
