<script>
	let { data } = $props();

	function fade(node) {
		return {
			duration: 100,
			tick: (t) => {
				node.style.opacity = String(t);
			}
		};
	}
</script>

<div out:fade|global>
	<p>{data.data}</p>
</div>
