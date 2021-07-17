<svelte:options tag="custom-element"/>

<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let show = false;

	onMount(() => {
		show = true;
	});
</script>

{#if show}
	<p transition:fade>
		Fades in and out
	</p>
{/if}
