<script>
	let bar = $state('');

	const value = {
		set value(v) {
			console.log('bind:value ' + $effect.tracking());
			bar = v;
		},
		get value() {
			return bar;
		}
	};

	const active = {
		set bar(_v) {
			console.log('bind:activeElement ' + $effect.tracking());
		}
	};

	let input;

	$effect(() => {
		input.value = 'everybody';
		input.dispatchEvent(new window.Event('input'));
	});
</script>

<svelte:document bind:activeElement={active.bar} />
<input type="text" bind:value={value.value} bind:this={input}>
