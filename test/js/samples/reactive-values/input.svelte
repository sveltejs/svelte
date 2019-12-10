<script>
	let name = 'world';
	$: foo = name + name;
</script>

<h1>Hello {name}!</h1>
{foo}