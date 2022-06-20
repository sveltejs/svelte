<script>
	export let thePromise;
</script>

{#await thePromise catch theError}
	<p>oh no! {theError.message}</p>
{/await}