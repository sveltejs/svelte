<script>
	import Hoverable from './Hoverable.svelte';
</script>

<Hoverable let:hovering={active}>
	<div class:active>
		{#if active}
			<p>On me survole.</p>
		{:else}
			<p>Survolez-moi !</p>
		{/if}
	</div>
</Hoverable>

<Hoverable let:hovering={active}>
	<div class:active>
		{#if active}
			<p>On me survole.</p>
		{:else}
			<p>Survolez-moi !</p>
		{/if}
	</div>
</Hoverable>

<Hoverable let:hovering={active}>
	<div class:active>
		{#if active}
			<p>On me survole.</p>
		{:else}
			<p>Survolez-moi !</p>
		{/if}
	</div>
</Hoverable>

<style>
	div {
		padding: 1em;
		margin: 0 0 1em 0;
		background-color: #eee;
	}

	.active {
		background-color: #ff3e00;
		color: white;
	}

	p {
		pointer-events: none;
	}
</style>
