<script>
	/** @type {{ push: (v: any) => void }} */
	let { push } = $props();

	let x = $state('x');
	let y = $derived(x.toUpperCase());

	$inspect(y, push);
</script>

<button on:click={() => x += 'x'}>{x}</button>
