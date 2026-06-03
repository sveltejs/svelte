<script>
	let ignore = null;
	let handler = () => console.log("clicked");
	let bad = "invalid";
	
</script>

<button onclick={ignore}>click</button>
<button onclick={handler}>click</button>
<button onclick={bad}>click</button>
