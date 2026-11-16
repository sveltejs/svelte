<script>
	let count = $state(0);
	const answer = Promise.withResolvers();

	export function bump() {
		count++;
	}

	export function resolve() {
		answer.resolve('ready');
	}

	const shown = $derived(await Promise.resolve('one'));
	const held = $derived(await answer.promise);
</script>

<p>{shown} {held} {count}</p>
