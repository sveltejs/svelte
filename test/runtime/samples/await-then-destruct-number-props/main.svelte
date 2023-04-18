<script>
	export let thePromise;
</script>

{#await thePromise}
	loading...
{:then { 1: a, 3: b, 4: c }}
	<p>[1] {a}</p>
	<p>[3] {b}</p>
	<p>[4] {c}</p>
{:catch { 0: d, 2: e, 5: f }}
	<p>[0] {d}</p>
	<p>[2] {e}</p>
	<p>[5] {f}</p>
{/await}
