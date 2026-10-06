<script>
	let show = $state(false);
	let x = $state(0);

	/** @type {(value: number) => void} */
	let resolve;
	const promise = new Promise((r) => (resolve = r));

	export function set(values) {
		if ('show' in values) show = values.show;
		if ('x' in values) x = values.x;
	}

	export function settle(value) {
		resolve(value);
	}
</script>

{#if show}{#await promise}<i>pending</i>{:then v}<q>{v}</q>{/await}{/if}<p>{x}</p>
