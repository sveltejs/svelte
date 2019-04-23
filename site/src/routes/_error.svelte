<script>
	const dev = process.env.NODE_ENV === 'development';

	export let status;
	export let error;

	// we don't want to use <svelte:window bind:online> here,
	// because we only care about the online state when
	// the page first loads
	let online = typeof navigator !== 'undefined'
		? navigator.onLine
		: true;
</script>

<style>
	.container {
		padding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);
	}

	h1, p { margin: 0 auto }

	h1 {
		font-size: 2.8em;
		font-weight: 300;
		margin: 0 0 0.5em 0;
	}

	p { margin: 1em auto }

	.error {
		background-color: #da106e;
		color: white;
		padding: 12px 16px;
		font: 600 16px/1.7 var(--font);
		border-radius: 2px;
	}

	/* @media (min-width: 480px) {
		h1 { font-size: 4em }
	} */
</style>

<svelte:head>
	<title>{status}</title>
</svelte:head>

<div class="container">
	{#if online}
		<h1>Yikes!</h1>

		{#if error.message}
			<p class="error">{status}: {error.message}</p>
		{:else}
			<p class="error">Encountered a {status} error</p>
		{/if}

		{#if dev && error.stack}
			<pre>{error.stack}</pre>
		{:else}
			{#if status >= 500}
				<p>Please try reloading the page.</p>
			{/if}

			<p>If the error persists, please drop by <a href="https://discord.gg/yy75DKs">Discord chatroom</a> and let us know, or raise an issue on <a href="https://github.com/sveltejs/svelte">GitHub</a>. Thanks!</p>
		{/if}
	{:else}
		<h1>It looks like you're offline</h1>

		<p>Reload the page once you've found the internet.</p>
	{/if}
</div>