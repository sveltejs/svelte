<script>
	function a(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.a = t;
			}
		};
	}
</script>

<div transition:a>a</div>