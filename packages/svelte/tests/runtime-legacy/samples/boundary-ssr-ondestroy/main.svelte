<script>
	import { onDestroy } from 'svelte';
	import Child from './Child.svelte';

	export let log;
	let value = 'bound';

	onDestroy(() => log.push('destroy root'));
</script>

<svelte:boundary>
	<Child name="first" {log} fail />
	{#snippet failed()}
		<Child name="first fallback" {log} />
	{/snippet}
</svelte:boundary>
<Child name="outside" {log} bind:value />
<svelte:boundary>
	<Child name="second" {log} fail />
	{#snippet failed()}
		<Child name="second fallback" {log} />
	{/snippet}
</svelte:boundary>
