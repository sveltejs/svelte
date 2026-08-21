<script>
	let count = $state(0);

	async function run() {
		await new Promise(r => setTimeout(r));
	}
	async function get() { 
		run();
		return 1;
	}
</script>

<button onclick={() => count++}>{count}</button>
{await get()}
