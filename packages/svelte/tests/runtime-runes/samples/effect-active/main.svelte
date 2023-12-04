<script>
	const foo = $effect.active();
	let bar = $state(false);
	$effect.pre(() => {
		bar = $effect.active();
	});
</script>

<p>{foo}</p>
<p>{bar}</p>
<p>{$effect.active()}</p>
