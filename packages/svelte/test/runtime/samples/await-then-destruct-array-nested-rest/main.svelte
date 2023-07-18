<script>
	export let thePromise;
</script>

{#await thePromise}
	loading...
{:then [ a, b, ...[,, c, ...{ length } ]]}
	<p>a: {a}</p>
	<p>b: {b}</p>
  <p>c: {c}</p>
  <p>remaining length: {length}</p>
{:catch [c, ...[d, e, f, ...[,,g]]]}
	<p>c: {c}</p>
	<p>d: {d}</p>
	<p>e: {e}</p>
  <p>f: {f}</p>
  <p>g: {g}</p>
{/await}
