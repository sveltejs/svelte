export function with_root(get_x) {
	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(get_x());
		});

		const nested_cleanup = $effect.root(() => {
			return () => {
				console.log('cleanup 2');
			};
		});

		return () => {
			console.log('cleanup 1');
			nested_cleanup();
		};
	});

	return cleanup;
}
