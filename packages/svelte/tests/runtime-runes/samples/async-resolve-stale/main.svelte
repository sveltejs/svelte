<script>
	let count = $state(0);
	let value = $state('');
	let prev;

	function asd(v) {
		const r = Promise.withResolvers();

		if (prev || v === '') {
			console.log('hello', !!prev)
			Promise.resolve().then(async () => {
				console.log('count++')
				count++;
				r.resolve(v);
				await new Promise(r => setTimeout(r, 0));
				// TODO with a microtask like below it still throws a mutation error
				// await Promise.resolve();
				prev?.resolve();
			})
		} else {
			console.log('other')
			prev = Promise.withResolvers();
			prev.promise.then(() => {
				console.log('other coun++')
				count++;
				r.resolve(v)
			})
		}
		
		return r.promise;
	}

	const x = $derived(await asd(value))
</script>

<input bind:value />

{count} | {x}