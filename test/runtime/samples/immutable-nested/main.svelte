<script>
	export let nested;

	import Nested from './Nested.svelte';
</script>

<div>
  <Nested bind:this={nested} />
</div>
