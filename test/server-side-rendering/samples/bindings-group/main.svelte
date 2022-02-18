<script>
	let tortilla = 'Plain';
	let fillings = ['Cheese'];
</script>

<div>{fillings.toString()}</div>

<input type="radio" bind:group={tortilla} value="Plain">
<input type="radio" bind:group={tortilla} value="Whole wheat">

<input type="checkbox" bind:group={fillings} value="Beans">
<input type="checkbox" bind:group={fillings} value="Cheese">
