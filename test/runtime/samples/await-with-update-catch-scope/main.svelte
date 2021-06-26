<script>
	export let thePromise;
	export let error;
</script>

<div>
	error: {error}
	{#await thePromise then _}
		After Resolve: {error}
	{:catch error}
		Rejected: {error}
	{/await}
</div>
