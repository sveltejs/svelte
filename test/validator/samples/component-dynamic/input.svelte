<script>
	import A from './A.svelte';
	import B from './B.svelte';

	let Let = A;
	function update() {
		Let = B;
	}

	export let ExportLet = B;

	$: Reactive = random() ? A : B;
</script>

<Let />
<ExportLet />
<Reactive />
<svelte:component this={Let} />