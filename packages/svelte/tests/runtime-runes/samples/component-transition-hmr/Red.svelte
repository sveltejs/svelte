<script>
	function show(node) {
			return {
					duration: 500,
					css: (t) => `opacity: ${t}`,
			}
	}
</script>

<div class="red" in:show></div>
