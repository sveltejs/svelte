<script>
	import Child from './Child.svelte';

	let a = $state(0);
	const a_bindings = [
		() => a,
		(v) => {
			console.log('a', v);
			a = v;
		}
	]
	let check = $state(true);
	const check_bindings = [
		() => check,
		(v) => {
			console.log('check', v);
			check = v;
		}
	]
</script>

<button onclick={() => a++}>a: {a}</button>

<Child
	bind:a={...a_bindings}
/>

<div>
	<input type="checkbox" bind:checked={...check_bindings} />
</div>
