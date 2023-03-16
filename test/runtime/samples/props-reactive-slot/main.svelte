<script>
	import Comp from './Comp.svelte'
	let p = "hi"
</script>

<Comp someprop={p} let:props>
	<h1>
		{props.someprop}
	</h1>
</Comp>

<button on:click={()=> p = "changed"}>Change
</button>