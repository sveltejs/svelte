<script>
	import One from "./One.svelte";

	const obj = {
		a: [{}],
		b: []
	};
</script>

<One bind:list={obj.a}/>
<One bind:list={obj.b}/>

<p>{obj.a.map(JSON.stringify)}</p>
<p>{obj.b.map(JSON.stringify)}</p>