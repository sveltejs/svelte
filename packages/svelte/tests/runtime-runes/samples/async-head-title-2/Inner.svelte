<script>
	let { deferred } = $props();

	function push() {
		const d = Promise.withResolvers();
		deferred.push(() => d.resolve('title'));
		return d.promise;
	}
</script>

<svelte:head>
	<title>{await push()}</title>
</svelte:head>
