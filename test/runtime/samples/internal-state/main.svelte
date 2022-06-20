<script>
	import Foo from './Foo.svelte';
	
	let x = 2;
</script>

<Foo internal={x}/>

<button on:click="{() => x += 1}">click me</button>