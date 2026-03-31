<script>
	let data = $state({ count: 0, label: 'clicks' });
</script>

<button onclick={() => data.count++}>{data.label}: {data.count}</button>
