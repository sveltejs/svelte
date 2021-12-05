<script>
	function make_uppercase() {
		this.value = this.value.toUpperCase();
	}
</script>
<input on:input={make_uppercase}>
