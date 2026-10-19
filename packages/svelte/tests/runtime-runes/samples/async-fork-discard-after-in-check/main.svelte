<script>
	import { fork } from 'svelte';

	const init = $state({ x: 1 });
	const init_missing = $state({});
	const root = $state({ x: 1 });
	const teardown = $state({ x: 1 });
	const after_await = $state({ x: 1 });

	let count = $state(0);

	// each object is first checked with `in` while an effect is active but no reaction is
	'x' in init;
	'y' in init_missing;

	$effect.root(() => {
		'x' in root;
	});

	$effect(() => {
		count;

		return () => {
			'x' in teardown;
		};
	});

	await Promise.resolve();

	'x' in after_await;
</script>

<button onclick={() => count++}>rerun</button>

<button
	onclick={() => {
		fork(() => {
			init.x = 2;
			init_missing.y = 1;
			root.x = 2;
			teardown.x = 2;
			after_await.x = 2;
		}).discard();

		console.log(init.x, 'y' in init_missing, root.x, teardown.x, after_await.x);
	}}
>
	discard
</button>
