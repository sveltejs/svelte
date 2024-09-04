<script>
	let foo;
</script>

<button tabindex='-1' aria-label="Button"></button>
<button tabindex='0' aria-label="Button"></button>
<button tabindex='1' aria-label="Button"></button>
<button tabindex='{foo}' aria-label="Button"></button>
