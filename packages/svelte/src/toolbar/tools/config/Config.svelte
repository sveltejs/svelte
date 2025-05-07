<script>
	import { configureSvelte } from '../../configure.svelte';

	/** @type {{ config: import('../../public.d.ts').ResolvedConfig }} */
	let { config } = $props();

	/** @type {import('../../public').Config["position"]} */
	let position = $state(config.position);

	// TODO: This probably should not be an effect, but I failed to get the typing right with the onchange event
	$effect(() => {
		configureSvelte({ position });
	});
</script>

<div>
	<label for="position">
		Position

		<select id="position" bind:value={position}>
			<option value="top-left">top left</option>
			<option value="top-right">top right</option>
			<option value="bottom-right">bottom right</option>
			<option value="bottom-left">bottom left</option>
		</select>
	</label>
</div>

<style>
	select option {
		color: black;
	}

	select:not(:checked) {
		color: var(--toolbar-color);
	}
</style>
