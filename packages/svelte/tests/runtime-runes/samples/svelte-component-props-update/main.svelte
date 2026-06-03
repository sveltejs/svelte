<script>
	import Comp_1 from './Comp-1.svelte';
	import Comp_2 from './Comp-2.svelte';

	let Comp = $state.raw(Comp_1);
	let data = $state.raw({ obj: { arr: [1, 2, 3] } });

	function change() {
		Comp = Comp_2;
		data = {};
	}
</script>

<button onclick={change}>Change</button>

<Comp {data} />
