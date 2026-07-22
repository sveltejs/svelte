<script>
	import { slide } from 'svelte/transition';

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

<div style="display: none">
	{#if visible}
		<p transition:slide>hello</p>
	{/if}
</div>
