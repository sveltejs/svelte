<script>
	import Widget from './Widget.svelte';

	export let a = ['foo', 'bar', 'baz'];
</script>

{#each a as x}
	<Widget bind:value={x}/>
{/each}

<p>{a.join(', ')}</p>