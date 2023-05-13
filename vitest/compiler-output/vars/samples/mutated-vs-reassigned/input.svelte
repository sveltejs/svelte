<script>
	let count;
	const user = { name: 'world' };
</script>

<input on:input="{e => user.name = e.value}">
<input type=number on:input="{e => count = +e.value}">