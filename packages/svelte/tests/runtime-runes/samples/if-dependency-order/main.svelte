<script>
	let data = $state({ num: 1 });

	function expire() {
		data.num = data.num - 1;
		if (data.num <= 0) data = undefined;
	}
</script>

{#if data}
	<button onclick={expire}>Click</button>
	<p>expires in {data.num} click</p>
{/if}
