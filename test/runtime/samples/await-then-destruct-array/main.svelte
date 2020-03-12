<script>
	export let thePromise;
</script>

{#await thePromise}
	loading...
{:then [ a, b ]}
	<p>a: {a}</p>
	<p>b: {b}</p>
{/await}