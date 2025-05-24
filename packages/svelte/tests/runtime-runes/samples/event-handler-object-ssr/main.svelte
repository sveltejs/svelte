<script>
	import Child from "./child.svelte";

	const onclick = {
		handleEvent() {}
	};
</script>

<button {onclick}>a</button>
<button {...{onclick}}>b</button>

<Child {onclick} />
