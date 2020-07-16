<script>
	let object = Promise.resolve({ a: 1, b: 2, c: 3 });
	let array = Promise.resolve([1, 2, 3, 4, 5, 6]);
	let objectReject = Promise.reject({ a: 1, b: 2, c: 3 });
	let arrayReject = Promise.reject([1, 2, 3, 4, 5, 6]);
</script>

{#await object then { a, ...rest }}
	<p>a: {a}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}

{#await array then [a, b, ...rest]}
	<p>a: {a}</p>
	<p>b: {b}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}

{#await objectReject then value}
	resolved
{:catch { a, ...rest }}
	<p>a: {a}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}

{#await arrayReject then value}
	resolved
{:catch [a, b, ...rest]}
	<p>a: {a}</p>
	<p>b: {b}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}