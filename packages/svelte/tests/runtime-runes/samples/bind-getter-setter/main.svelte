<script>
	import Child from './Child.svelte';

	let a = $state(0);
</script>

<button onclick={() => a++}>a: {a}</button>

<Child
	bind:a={() => a,
	(v) => {
		console.log('a', v);
		a = v;
	}}
/>

