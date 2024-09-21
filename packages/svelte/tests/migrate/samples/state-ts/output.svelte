<script lang="ts">
	import { listener } from 'svelte/legacy';

	// here is a comment
	let div: HTMLIFrameElement = $state();
	let count = $state(0);
</script>

<div bind:this={div}></div>
<button use:listener={[() => count++,"click"]}>{count}</button>