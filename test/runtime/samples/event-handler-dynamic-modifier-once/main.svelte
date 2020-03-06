<script>
	let f;
	export let count = 0;
	f = () => count += 1;
</script>

<button on:click|once="{f}">{count}</button>