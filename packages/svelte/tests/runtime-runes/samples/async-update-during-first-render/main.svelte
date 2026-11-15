<script>
	let count = $state(0);
	let value = $state.raw(Promise.resolve('one'));

	/** @type {Map<number, (n: number) => void>} */
	const answers = new Map();

	/** @param {number} n */
	function slow(n) {
		console.log(n);
		return new Promise((resolve) => answers.set(n, resolve));
	}

	export function bump() {
		count++;
	}

	export function resolve() {
		for (const [n, fn] of answers) fn(n);
	}

	const shown = $derived(await value);
	const held = $derived(await slow(count));
</script>

<p>{shown} {held}</p>
