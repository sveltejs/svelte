<script>
	let href = $state('');
 
	const resolvers = [];

	function push(value) {
		if (!href) return '';
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}

	const loaded = $derived(await push(href));
</script>

<button onclick={() => resolvers.shift()()}>resolve</button>

{#if $state.eager(href) === '/a' && $state.eager(href) !== href}
	<p>Loading...</p>
{:else}
	<button class="a" onclick={() => { 
		href = '/a'
	}}>/a</button>
{/if}

{#if $state.eager(href) === '/b' && $state.eager(href) !== href}
	<p>Loading...</p>
{:else}
	<button class="b" onclick={() => { 
		href = '/b'
	}}>/b</button>
{/if}

{loaded}
