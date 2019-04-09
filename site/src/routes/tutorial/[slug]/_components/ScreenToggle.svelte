<script>
	export let offset = 0;
</script>

<style>
	.toggle {
		width: 100%;
		height: 42px;
		display: flex;
		justify-content: center;
		align-items: center;
		border-top: 1px solid var(--second);
	}

	button {
		padding: 0.3em 0.6em;
		border-radius: 1em;
		line-height: 1;
		height: 1em;
		box-sizing: content-box;
		color: #999;
		border: 1px solid #f4f4f4;
		width: 4em;
		margin: 0 0.15em;
	}

	.selected {
		background-color: var(--prime);
		color: white;
	}
</style>

<div class="toggle">
	<button class:selected={offset === 0} on:click={() => offset = 0}>tutorial</button>
	<button class:selected={offset === 1} on:click={() => offset = 1}>input</button>
	<button class:selected={offset === 2} on:click={() => offset = 2}>output</button>
</div>