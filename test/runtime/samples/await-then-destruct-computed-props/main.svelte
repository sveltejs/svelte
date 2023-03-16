<script>
	export let object = Promise.resolve({ prop1: { prop4: 2, prop5: 3 }, prop2: { prop6: 5, prop7: 6, prop8: 7 }, prop3: { prop9: 9, prop10: 10 } });
	const objectReject = Promise.reject({ propZ: 5, propY: 6, propX: 7, propW: 8 });

	let num = 1;
	const prop = 'prop';
</script>

{#await object then { [`prop${num++}`]: { [`prop${num + 3}`]: propA }, [`prop${num++}`]: { [`prop${num + 5}`]: propB }, ...rest }}
	<p>propA: {propA}</p>
	<p>propB: {propB}</p>
	<p>num: {num}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}

{#await objectReject then value}
	resolved
{:catch { [`${prop}Z`]: propZ, [`${prop}Y`]: propY, ...rest }}
	<p>propZ: {propZ}</p>
	<p>propY: {propY}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}

