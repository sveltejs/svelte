<script>
	import Component from './Component.svelte';

	let p = $state('b');

	$effect.pre(() => {
		console.log('pre')
		if (p === 'a') p = null;
	})
</script>

{#if p || !p}
	{#if p}
		<Component {p} />
	{/if}
{/if}

<button onclick={() => p = 'a'}>a</button>
