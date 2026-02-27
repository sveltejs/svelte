<script>
	let href = $state('');

	async function load(href) {
		if (!href) return '';
		await new Promise(r => setTimeout(r, 100));
		return href;
	}

	const loaded = $derived(await load(href));
</script>

{#if $state.eager(href) === '/a'}
	<p>Loading...</p>
{:else}
	<button class="a" onclick={() => { 
		href = '/a'
	}}>/a</button>
{/if}

{#if $state.eager(href) === '/b'}
	<p>Loading...</p>
{:else}
	<button class="b" onclick={() => { 
		href = '/b'
	}}>/b</button>
{/if}

{loaded}
