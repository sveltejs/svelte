<script>
	import Child from './Child.svelte';

	let child;
</script>

<Child bind:this={child} />
<button onclick={() => {
	child.foo();
	child.bar();
}}>log</button>
