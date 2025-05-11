<script>
	let count = $state(0);

	let onclick = $state({
		handleEvent(ev) {
			count += +ev.currentTarget.dataset.step;
		}
	});
</script>

<button data-step="2" {onclick}>
	clicks: {count}
</button>
