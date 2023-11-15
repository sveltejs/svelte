<script>
	export let checked = false;

	import Checkbox from './Checkbox.svelte';
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="input-output-toggle">
	<span class:active={!checked} style="text-align: right">input</span>
	<span style="display:grid; place-items: center">
		<Checkbox bind:checked />
	</span>
	<span class:active={checked}>output</span>
</label>

<style>
	.input-output-toggle {
		position: relative;
		display: grid;
		user-select: none;
		flex: 0;
		grid-template-columns: 1fr 40px 1fr;
		grid-gap: 0.5em;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 42px;
		border-top: 1px solid var(--sk-theme-2);
		z-index: 2;
	}

	span {
		color: var(--sk-text-4);
	}

	.active {
		color: var(--sk-text-2);
	}
</style>
