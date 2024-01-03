<script>
	let value = $state('red');
	let tag = $state('div');

	const getValue = () => {
		return value;
	}
	const getClass = () => {
		return value === 'blue';
	}
	const getSpread = () => {
		return { class: value };
	}
	const props = {
		get class() {
			return value;
		}
	}
</script>

<div class:blue={getClass()} style:color={getValue()}></div>
<div {...getSpread()}></div>
<div {...props}></div>

<svelte:element this={tag} class:blue={getClass()} style:color={getValue()}></svelte:element>
<svelte:element this={tag} {...getSpread()}></svelte:element>
<svelte:element this={tag} {...props}></svelte:element>

<button on:click={() => value = 'blue'}>toggle</button>
