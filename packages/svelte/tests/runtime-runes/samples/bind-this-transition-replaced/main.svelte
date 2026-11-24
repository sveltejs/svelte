<script lang="ts">
	import { fade } from 'svelte/transition';

	let count = $state(1);
	let button: HTMLButtonElement | undefined = $state();
</script>

{#key count}
	<button transition:fade bind:this={button} onclick={() => count++}>{count}</button>
{/key}

<output>{button?.textContent}</output>
