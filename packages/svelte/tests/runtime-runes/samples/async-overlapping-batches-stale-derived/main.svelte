<script>
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let sum = $derived(a + b);
	const registry = [];

	export const log = [];

	$effect(() => {
		log.push(sum);
	});

	let slow = $derived(await f('slow', c));

	function f(tag, value) {
		return new Promise((resolve) => registry.push(() => resolve(`${tag}${value}`)));
	}

	export function set_b(v) {
		b = v;
	}

	export function resolve_all() {
		for (const r of registry.splice(0)) r();
	}
</script>

<p>{await f('p', a)}|{sum}</p>
{#key c}
	<em>{slow}|{await f('key', b)}</em>
{/key}
