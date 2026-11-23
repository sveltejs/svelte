<script>
	import Nested from './Nested.svelte';

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<Nested depth={2} />
{/if}
