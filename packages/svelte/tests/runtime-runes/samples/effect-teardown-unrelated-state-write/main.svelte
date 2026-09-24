<script>
	import Child from './Child.svelte';

	let track = $state(0);
	let value = $state(true);
	let other = $state(true);
	let thing1 = $state(true);
	let thing2 = true;
	let derived = $derived(thing1);

	$effect(() => {
		track;

		return () =>
			console.log(
				`track = ${track}, thing1 = ${thing1}, thing2 = ${thing2}, derived = ${derived}`
			);
	});

	$effect(() => {
		derived;

		return () => console.log(`tracked derived = ${derived}`);
	});

	$effect(() => {
		track;

		return () => console.log(`tracked derived = ${derived}`);
	});
</script>

<button onclick={() => {
	value = !value;
	other = !other;
	thing1 = !thing1;
	thing2 = !thing2;
	track++;
}}>Re-run effect</button>

{thing1} {thing2}

<Child {track} {value} {other} />
