<script>
	let { onloaded = () => {}, onfailed = () => {} } = $props();
</script>

<svelte:head>
	<link rel="preload" as="image" href="/preloaded.png" onload={onloaded} />
</svelte:head>

<img alt="a" src="/a.png" onload={onloaded} onerror={onfailed} />
<img alt="b" src="/b.png" onload={onloaded} />
