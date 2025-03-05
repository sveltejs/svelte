<script>
	let obj = $state({ count: 0 });

	$effect.root(() => {
		let teardown;

		$effect.pre(() => {
			if (obj) {
				teardown ??= $effect.root(() => {
					$effect.pre(() => {
						console.log(obj.count);
					});
				});
			} else {
				teardown?.();
				teardown = null;
			}
		});
	});
</script>

<button onclick={() => ((obj ??= { count: 0 }).count += 1)}>+1</button>
<button onclick={() => (obj = null)}>null</button>
