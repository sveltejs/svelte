<script>
	import Component from './Component.svelte';
	let arr = $state.raw([1, 2, 3]);
</script>

<button onclick={()=>{
	arr = [4,5,6];
}}>update</button>

<Component {arr}/>