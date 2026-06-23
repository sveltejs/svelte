<script>
	import SelectOptionWithoutSpread from './SelectOptionWithoutSpread.svelte';
	import SelectOptionWithSpread from './SelectOptionWithSpread.svelte';

	let value0 = $state();
	let value1 = $state();

	const options = [
		{ value: undefined, label: 'undefined' },
		{ value: null, label: 'null' },
		{ value: '', label: '""' },
		{ value: false, label: 'false' },
		{ value: true, label: 'true' },
		{ value: 0, label: '0' },
		{ value: 1, label: '1' },
		{ value: '0', label: '"0"' },
		{ value: '1', label: '"1"' },
		{ value: { prop: 1 }, label: '{ prop: 1 }' }
	];
</script>

<SelectOptionWithoutSpread bind:value={value0} {options} />
<SelectOptionWithSpread bind:value={value1} {options} />
