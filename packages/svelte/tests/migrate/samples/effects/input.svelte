<script>
	let count = 0;
	$: console.log(count);
	$: if (count > 10) {
		alert('too high')
	}
	$: {
		console.log('foo');
		if (x) break $;
		console.log('bar');
	}
	$: $count = 1;
</script>
