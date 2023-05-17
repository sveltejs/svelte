<script>
	let x = 0;
</script>

<button on:click="{() => ({ x } = { x: 1 })}">foo</button>
<button on:click="{() => ([x] = [2])}">bar</button>

<p>x: {x}</p>