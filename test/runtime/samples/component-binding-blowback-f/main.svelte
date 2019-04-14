<script>
	import One from "./One.svelte";

	const obj = {
		a: [{}],
		b: []
	};
</script>

<One bind:list={obj.a} i={0}/>
<One bind:list={obj.b} i={1}/>

<p>{obj.a.map(JSON.stringify)}</p>
<p>{obj.b.map(JSON.stringify)}</p>