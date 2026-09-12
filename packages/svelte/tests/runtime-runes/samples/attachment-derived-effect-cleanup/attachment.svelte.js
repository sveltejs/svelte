export function create_attachment(input) {
	$effect(() => () => console.log(`cleanup ${input.id}`));

	// This effect has no reactive dependencies or cleanup.
	$effect(() => console.log(`setup ${input.id}`));

	$effect.pre(() => {
		void input.index;
	});
	$effect(() => {
		void input.index;
	});

	return { attach: () => () => {} };
}
