<script>
	import Child from './Child.svelte';

	let options = $state([
		{ a: 1, v: 'a1' },
		{ a: 2, v: 'a2' },
		{ a: 3, v: 'a3' }
	]);
</script>

<button onclick={() => options.reverse()}>reverse</button>
<Child {options} labelKey="a" valueKey="v" />
