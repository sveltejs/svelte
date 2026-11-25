<script>
	let n = $state(0);

	let d = $derived.by(() => {
		if (n === 1) throw 'error';
		return n;
	});

	function read() {
		try {
			console.log(d);
		} catch (e) {
			console.log(`threw ${e}`);
		}
	}
</script>

<button
	onclick={() => {
		n++;
		read();
	}}>increment</button
>
<button
	onclick={() => {
		d = 42;
		read();
	}}>assign</button
>
