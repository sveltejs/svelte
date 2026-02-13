<script>
	let { deferred, title } = $props();

	function push() {
		const d = Promise.withResolvers();
		deferred.push(() => d.resolve());
		return d.promise;
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<p>{await push()}</p>
