<script>
	let object = Promise.resolve({ b: 2, c: 3 });
	let array = Promise.resolve([1, 2]);
	let objectReject = Promise.reject({ b: 2, c: 3 });
	let arrayReject = Promise.reject([1, 2]);
</script>

{#await object then { a = 3, b = 4, c }}
	<p>a: {a}</p>
	<p>b: {b}</p>
	<p>c: {c}</p>
{/await}

{#await array then [a, b, c = 3]}
	<p>a: {a}</p>
	<p>b: {b}</p>
	<p>c: {c}</p>
{/await}

{#await objectReject then value}
	resolved
{:catch { a = 3, b = 4, c }}
	<p>a: {a}</p>
	<p>b: {b}</p>
	<p>c: {c}</p>
{/await}

{#await arrayReject then value}
	resolved
{:catch [a, b, c = 3]}
	<p>a: {a}</p>
	<p>b: {b}</p>
	<p>c: {c}</p>
{/await}