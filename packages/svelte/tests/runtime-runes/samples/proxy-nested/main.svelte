<script>
	const inner = $state({
		count: 0
	})

	const object = $state({
		outer: {
			inner
		}
	});
</script>

<button onclick={() => inner.count += 1}>
	clicks: {object.outer.inner.count}
</button>
