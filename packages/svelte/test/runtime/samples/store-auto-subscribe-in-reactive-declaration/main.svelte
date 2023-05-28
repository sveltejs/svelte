<script>
	export let count;

	let double;
	$: double = $count * 2;
</script>

<button on:click="{() => count.update(n => n + 1)}">double {double}</button>