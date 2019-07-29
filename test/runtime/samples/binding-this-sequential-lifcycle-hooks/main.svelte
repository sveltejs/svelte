<script>
	// adapted from https://svelte.dev/repl/8a96e6e545244bff9fd0125b152d6840?version=3.6.9
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';

	export let ref = null, bind = true, hooks = [];

	// using push to not make hooks reactive
  beforeUpdate(() => hooks.push('Before'))
  afterUpdate(() => hooks.push('After'))
	onMount(() => hooks.push('Mount'))
</script>

{#if bind}
	<div bind:this={ref}>bind</div>
{/if}
