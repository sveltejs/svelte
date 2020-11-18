<script>
	import IconA from './IconA.svelte';
	import IconB from './IconB.svelte';

	let variable = false;
</script>

<button on:click={() => variable = !variable}>Click Me</button>
<div>
	<slot>
		<svelte:component this={variable ? IconA : IconB} />
	</slot>
</div>
