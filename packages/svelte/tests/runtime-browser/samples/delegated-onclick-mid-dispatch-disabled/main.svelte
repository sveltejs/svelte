<script>
	import { on } from 'svelte/events';

	let attach_count = $state(0);
	let onclick_count = $state(0);

	// throttle, as in https://github.com/sveltejs/svelte/issues/18070
	function throttle(node) {
		let throttled = $state(false);

		const off = on(node, 'click', () => {
			attach_count += 1;
			throttled = true;
		});

		$effect(() => {
			if (throttled) {
				node.disabled = true;
				return () => {
					node.disabled = false;
				};
			}
		});

		return () => off();
	}
</script>

<button {@attach throttle} onclick={() => (onclick_count += 1)}>
	<span>click me</span>
</button>

<p>attach: {attach_count}, onclick: {onclick_count}</p>
