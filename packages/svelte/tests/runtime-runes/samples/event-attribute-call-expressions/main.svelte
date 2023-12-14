<script>
	let value = $state('red');

	const getValue = () => {
		return value;
	}
	const getClass = () => {
		return value === 'blue';
	}
	const getSpread = () => {
		return { class: value };
	}
</script>

<div class:blue={getClass()} style:color={getValue()}></div>
<div {...getSpread()}></div>
<button on:click={() => value = 'blue'}>toggle</button>

