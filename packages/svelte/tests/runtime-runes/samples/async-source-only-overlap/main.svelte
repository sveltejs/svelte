<script>
	let a = $state(0);
	let b = $state(0);
	let deferreds = [];
	const value = () => (`${a}_${b}`);

	function push(value) {
		if (!value) return value;
		return new Promise((resolve) => {
			deferreds.push(() => resolve(value));
		});
	}
</script>

<button onclick={() => {a++;b++}}>a_b {value()}</button>
<button onclick={() => (b++)}>b {b}</button>
<button onclick={() => (deferreds.shift()?.())}>resolve</button>
{await push(a)}
