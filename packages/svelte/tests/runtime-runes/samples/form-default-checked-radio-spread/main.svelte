<script>
	let spread = { defaultChecked: true, checked: true };
</script>

<form>
	<input type="radio" name="option" value="a" {...spread} />
	<input type="radio" name="option" value="b" />
	<input type="reset" value="Reset" />
</form>
