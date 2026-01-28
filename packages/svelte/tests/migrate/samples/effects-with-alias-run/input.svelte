<script>
	let count = 0;
	let run = true;
	$: console.log(count);
	$: if (count > 10 && run) {
		alert('too high')
	}
	$: {
		console.log('foo');
		if (x) break $;
		console.log('bar');
	}
	$: $count = 1;
</script>
