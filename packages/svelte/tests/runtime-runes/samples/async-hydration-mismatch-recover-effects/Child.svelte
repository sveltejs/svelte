<script>
	import { onMount } from 'svelte';

	let { label } = $props();

	onMount(() => console.log('mount'));
	$effect(() => console.log('effect'));
</script>

<svelte:head>
	<meta name="child" content="" />
</svelte:head>

<span>{label}</span>
<input />
{#if true}
	<p>after</p>
{/if}
