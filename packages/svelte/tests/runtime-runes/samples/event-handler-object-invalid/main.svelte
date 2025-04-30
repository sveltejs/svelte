<script>
	let empty = {};
	let wrong = { handleEvent: "bad" };
</script>

<button onclick={empty}>click</button>
<button onclick={wrong}>click</button>
