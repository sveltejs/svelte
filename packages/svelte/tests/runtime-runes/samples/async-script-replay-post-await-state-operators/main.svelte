<script lang="ts">
	await Promise.resolve();

	const constant = $state(7);
	let count = $state(1);
	let big = $state(1n);
	let raw = $state.raw({ n: 1 });
	let result = $state('ready');
</script>

<button onclick={() => {
	const a = count++;
	const b = ++count;
	const c = count--;
	const d = --count;
	result = `${typeof a}:${a},${b},${c},${d}`;
}}>number updates</button>
<button onclick={() => {
	const a = big++;
	const b = ++big;
	const c = big--;
	const d = --big;
	result = `${typeof a}:${a},${b},${c},${d}`;
}}>bigint updates</button>
<button onclick={() => {
	count += 4;
	raw = { n: raw.n + 1 };
	result = 'replace';
}}>replace</button>
<input type="number" bind:value={count} />
<output>{constant}|{count}|{big}|{raw.n}|{result}</output>
