<script>
	export let checked = false;
</script>

<input type="checkbox" bind:checked />

<style>
	input[type='checkbox'] {
		/* display: block; */
		position: relative;
		height: 1em;
		width: calc(100% - 0.6em);
		max-width: 2em;
		top: -2px;
		border-radius: 0.5em;
		-webkit-appearance: none;
		appearance: none;
		outline: none;
		border: transparent;
		margin: 0 0.6em 0 0;
	}

	input[type='checkbox']::before {
		content: '';
		position: absolute;
		display: block;
		height: 100%;
		width: 100%;
		padding: 2px;
		border-radius: 1em;
		top: 0;
		left: 0;
		background: var(--sk-theme-2);
		/* box-sizing: border-box; */
		box-sizing: content-box;
	}

	input[type='checkbox']:checked::before {
		background: var(--sk-theme-1);
	}

	input[type='checkbox']::after {
		content: '';
		position: absolute;
		display: block;
		height: 1em;
		width: 1em;
		top: 2px;
		left: 2px;
		border-radius: 1em;
		background: white;
		box-shadow:
			0 0px 1px rgba(0, 0, 0, 0.4),
			0 4px 2px rgba(0, 0, 0, 0.1);
		transition:
			background 0.2s ease-out,
			left 0.2s ease-out;
	}

	input[type='checkbox']:checked::after {
		left: calc(100% - 1em + 2px);
	}
</style>
