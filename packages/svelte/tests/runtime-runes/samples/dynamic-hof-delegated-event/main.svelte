<script>
	let hof = $state((name) => () => console.log('A' + name));
	const member = $derived({
		hof
	});
	function change() {
		hof = (name) => () => console.log('B' + name);
	}
</script>

<button onclick={hof('A')}>A</button>
<button onclick={member.hof('B')}>B</button>

<br />
<button onclick={change}>change</button>
