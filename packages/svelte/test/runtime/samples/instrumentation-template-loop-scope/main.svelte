<script>
	let x = 0;
</script>

<button on:click="{() => {
	(() => {
		for (let x = 0; x < 10; x++) {}
		x = 42;
	})();
}}">foo</button>

<p>x: {x}</p>