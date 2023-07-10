<script>
	import Hoverable from './Hoverable.svelte';
</script>

<Hoverable>
	<div class:active={hovering}>
		{#if hovering}
			<p>I am being hovered upon.</p>
		{:else}
			<p>Hover over me!</p>
		{/if}
	</div>
</Hoverable>

<style>
	div {
		padding: 1em;
		margin: 0 0 1em 0;
		background-color: #eee;
    color: black;
	}

	.active {
		background-color: #ff3e00;
		color: white;
	}
</style>
