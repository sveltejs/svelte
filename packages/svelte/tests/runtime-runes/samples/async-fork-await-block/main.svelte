<script>
	let b = $state(0);
	const registry = [];

	function f(value) {
		return new Promise((resolve, reject) =>
			registry.push(() => (value < 0 ? reject(value) : resolve(value)))
		);
	}

	export function set_b(v) {
		b = v;
	}

	export function resolve_all() {
		for (const r of registry.splice(0)) r();
	}

	export function pending() {
		return registry.length;
	}
</script>

{#await f(b) then v}<q>{v}</q>{:catch e}<s>{e}</s>{/await}
