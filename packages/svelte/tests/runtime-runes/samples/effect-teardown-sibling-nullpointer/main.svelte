<script>
		let go = $state(false);
		let object = $state({ id: 1 });

		$effect(() => {
			if (go) object = null;
		});

		$effect(() => {
			go;

			if (object) {
				console.log('up:' + object.id);
				return () => {
					try { console.log('down:' + object.id); }
					catch (error) { console.log('error:' + error.message); }
				};
			}
		});
</script>

<button onclick={() => go = true}>go</button>
