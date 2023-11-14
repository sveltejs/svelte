<script>
	import AfterUpdate from "./sub.svelte";
	let count = 0;
	let count2 = 0;

	function increment() {
		count += 1;
	}
	function increment2() {
		count2 += 1;
	}
</script>

<button on:click={increment}>
	count: {count}
</button>
<button on:click={increment2}>
	count 2: {count2}
</button>
<hr />
<AfterUpdate {count} {count2}/>
