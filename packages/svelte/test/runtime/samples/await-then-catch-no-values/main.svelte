<script>
	export let thePromise;
</script>

{#await thePromise}
	waiting
{:then}
	resolved
{:catch}
	rejected
{/await}