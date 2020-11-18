<script>
	export let thePromise;
</script>

{#await thePromise}
	loading...
{:then [ a, b ]}
	<p>a: {a}</p>
	<p>b: {b}</p>
{:catch [c, [d, e]]}
	<p>c: {c}</p>
	<p>d: {d}</p>
	<p>e: {e}</p>
{/await}