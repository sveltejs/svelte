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

<!-- Here, we test to see if svelte-ignore works with reactive-component -->
<!-- svelte-ignore reactive-component -->
<Let />
<div>
  <!-- svelte-ignore reactive-component -->
  <ExportLet />
  <div>
    <!-- svelte-ignore reactive-component -->
    <Reactive />
  </div>
</div>
