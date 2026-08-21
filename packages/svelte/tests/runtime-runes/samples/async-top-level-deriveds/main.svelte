<script module>
	export let resolve = [];
</script>

<script>
	import Foo from './Foo.svelte';
	
	let show = $state(false);
</script>

<button onclick={() => show = true}>
	show
</button>

<button onclick={() => resolve.shift()()}>
	resolve
</button>

<svelte:boundary>
	{#if show}
		<Foo/>
	{/if}

	{#if $effect.pending()}
		<p>pending...</p>
	{/if}

	{#snippet pending()}
		<p>initializing...</p>
	{/snippet}
</svelte:boundary>
