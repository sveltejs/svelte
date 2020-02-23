<script>
	import Widget from './Widget.svelte';
	const values = ['foo', 'bar'];
</script>

{#each values as value}
	<Widget bind:value/>
{/each}
