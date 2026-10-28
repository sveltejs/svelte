<script>
	let value = $derived.by(() => {
		throw 'boom';
	});
</script>

<button
	onclick={() => {
		try {
			console.log(value);
		} catch (e) {
			console.log(`error: ${e}`);
		}

		value = 'boom';

		try {
			console.log(value);
		} catch (e) {
			console.log(`error: ${e}`);
		}
	}}>test</button
>
