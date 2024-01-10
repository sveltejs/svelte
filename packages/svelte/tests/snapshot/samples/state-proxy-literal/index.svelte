<script>
	let str = $state('');
	let tpl = $state(``);

	function reset() {
		str = '';
		str = ``;

		tpl = '';
		tpl = ``;
	}
</script>

<input bind:value={str} />
<input bind:value={tpl} />

<button onclick={reset}>reset</button>
