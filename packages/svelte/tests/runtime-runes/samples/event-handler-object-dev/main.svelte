<script>
	let count = $state(0);

	let onclick = $state({
		handleEvent() {
			count += +this.dataset.step;
		}
	});
</script>

<button data-step="2" {onclick}>
	clicks: {count}
</button>
