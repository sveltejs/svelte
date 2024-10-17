<script>
	function fade(_) {
		return {
			duration: 100,
			css: (t) => `opacity: ${t}`
		};
	}


</script>

<p transition:fade>foo</p>

