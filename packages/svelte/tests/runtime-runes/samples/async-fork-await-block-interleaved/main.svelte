<script>
	let a = $state(0);
	let b = $state(0);

	/** @type {Map<string, Array<() => void>>} */
	const registry = new Map();
	/** @type {Map<string, Promise<number>>} */
	const promises = new Map();

	function f(tag, value) {
		const promise = new Promise((resolve) => {
			const key = tag + value;
			if (!registry.has(key)) registry.set(key, []);
			registry.get(key).push(() => resolve(value));
		});
		promises.set(tag, promise);
		return promise;
	}

	export function set(values) {
		if ('a' in values) a = values.a;
		if ('b' in values) b = values.b;
	}

	/** resolve the promises created for `tag` and `value` */
	export function settle(tag, value) {
		for (const r of registry.get(tag + value) ?? []) r();
		registry.delete(tag + value);
	}

	/** the latest promise created for `tag` */
	export function latest(tag) {
		return promises.get(tag);
	}
</script>

{#await f('a', a)}<i>pending</i>{:then v}<q>{v}</q>{/await}
{#await f('b', b)}<i>pending</i>{:then v}<s>{v}|{a}</s>{/await}
