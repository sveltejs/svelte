<script>
	import Foo from './Foo.svelte';
	let show = $state(true);
	let count = $state(0);
</script>

<button onclick={() => show = !show}>Show</button>
{#if show}
	<Foo bind:count />
{/if}