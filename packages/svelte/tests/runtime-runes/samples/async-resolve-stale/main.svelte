<script>
	let count = $state(0);
	let value = $state('');

	let resolver;

	function asd(v) {
		let r = Promise.withResolvers();

		function update_and_resolve() {
			count++;
			r.resolve(v);
		}

		// make sure the second promise resolve before the first one
		if (resolver){
			new Promise(r => {
				setTimeout(r);
			}).then(update_and_resolve).then(() => {
				setTimeout(() => {
					resolver();
					resolver = null;
				});
			});
		} else if (v) {
			resolver = update_and_resolve;
		} else {
			Promise.resolve().then(update_and_resolve);
		}

		return r.promise;
	}

	const x = $derived(await asd(value))
</script>

<input bind:value />

{count} | {x}
