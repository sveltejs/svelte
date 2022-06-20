<script>
	import Nested from './Nested.svelte';

	export let nested;
</script>

<Nested bind:this={nested}>
	<p>override default slot</p>
</Nested>