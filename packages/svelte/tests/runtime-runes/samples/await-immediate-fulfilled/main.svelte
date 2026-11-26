<script>
	let p = $state(null);
</script>

<button onclick={()=>{
	p = new Promise((resolve, reject) => {
		resolve("?");
	});
}}>Resolve (immediate)</button>
<button onclick={()=>{
	p = new Promise((resolve, reject) => {
		setTimeout(() => resolve("OK"), 1);
	});
}}>Resolve (timeout)</button>
<button onclick={()=>{
	p = new Promise((resolve, reject) => {
		reject("??");
	});
}}>Reject (immediate)</button>
<button onclick={()=>{
	p = new Promise((resolve, reject) => {
		setTimeout(() => reject("Yeah"), 1);
	});
}}>Reject (timeout)</button>

<p>
	{#await p}
		...
	{:then v}
		resolved [{v}]
	{:catch err}
		err [{err}]
	{/await}
</p>
