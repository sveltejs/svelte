<script>
	function onclick(e) {
		// should log false when we click the span
		console.log(e.currentTarget === e.target)
	}
</script>


<button {onclick}>
	<span>
		Click me
	</span>
</button>
