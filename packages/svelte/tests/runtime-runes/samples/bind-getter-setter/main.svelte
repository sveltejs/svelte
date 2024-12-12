<script>
	import Child from './Child.svelte';

	let a = $state(0);
	let check = $state(true);
</script>

<button onclick={() => a++}>a: {a}</button>

<Child
	bind:a={() => a,
	(v) => {
		console.log('a', v);
		a = v;
	}}
/>

<div>
	<input type="checkbox" 
	bind:checked={()=>check,
	(v)=>{
		console.log('check', v);
		check = v;
	}} />
</div>