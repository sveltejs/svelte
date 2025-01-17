<script>
	let stuff = $state({
		attachments: [() => console.log('hello')]
	});
</script>

<div {...stuff}></div>
