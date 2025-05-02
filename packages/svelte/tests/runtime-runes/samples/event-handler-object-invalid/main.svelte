<script>
	let empty = {};
	let nully = { handleEvent: null };
	let wrong = { handleEvent: "bad" };
</script>

<button onclick={empty}>click</button>
<button onclick={nully}>click</button>
<button onclick={wrong}>click</button>
