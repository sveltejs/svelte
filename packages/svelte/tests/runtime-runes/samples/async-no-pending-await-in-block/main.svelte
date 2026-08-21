<script>
	let { browser = typeof window !== 'undefined' } = $props();
</script>

{#if await true}
	<h1>hello from the {browser ? 'browser' : 'server'}</h1>
{/if}

<h2>hello from the {browser ? 'browser' : 'server'}</h2>
<h3>hello from the {browser ? 'browser' : 'server'}</h3>
