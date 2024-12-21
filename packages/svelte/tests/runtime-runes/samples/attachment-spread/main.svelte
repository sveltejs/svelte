<script>
	let stuff = $state({
		[Symbol()]: () => console.log('hello')
	});
</script>

<div {...stuff}></div>
