<script>
	// An own `__proto__` key comes from JSON, which is where state hydrated
	// from a response, from storage, or from a query string comes from.
	let state = $state(JSON.parse('{"__proto__":{"admin":true},"b":2}'));

	const snapshot = $state.snapshot(state);
</script>

<div>{JSON.stringify(Object.keys(snapshot))}</div>
<div>{Object.getPrototypeOf(snapshot) === Object.prototype}</div>
<div>{snapshot.admin}</div>
