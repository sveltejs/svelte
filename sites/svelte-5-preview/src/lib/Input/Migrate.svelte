<script>
	import { get_repl_context } from '$lib/context.js';

	const { migrate } = get_repl_context();
</script>

<div class="container">
	<button on:click={migrate} title="Migrate this component towards the new syntax">migrate</button>
</div>

<style>
	button {
		position: relative;
		display: flex;
		text-transform: uppercase;
		font-size: 1.4rem;
		padding: 0.8rem;
		gap: 0.5rem;
		margin-right: 0.3rem;
		z-index: 9999;
	}
</style>
