<script>
	function handleClick() {
		alert("plus d'alertes");
	}
</script>

<button on:click|once={handleClick}> Cliquez moi </button>
