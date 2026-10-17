<script>
	let array = $state([], {
		onchange() {
			console.log($state.snapshot(array));
		}
	});
</script>

<!-- clicking either of these buttons should result in at most one log -->
<button onclick={() => array = [{}, {}, {}, {}, {}, {}, {}, {}]}>populate array</button>
<button onclick={() => array.length = 0}>clear array</button>

<!-- without this, nested proxies aren't created -->
<pre>{JSON.stringify(array)}</pre>