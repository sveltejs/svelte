<script>
	import { onMount } from 'svelte';
	import { mountComponentWithContext } from './module.svelte.js';

	let mountTarget;

	let getShowText;
	let setShowText;

	onMount(() => {
		const r = mountComponentWithContext(mountTarget);
		getShowText = r.getShowText;
		setShowText = r.setShowText;
	});

	function toggleState() {
		setShowText(!getShowText());
	}
</script>

<button onclick={() => toggleState()}>toggle</button>
<div bind:this={mountTarget}></div>
