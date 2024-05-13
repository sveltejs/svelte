<script>
	function run(){
		let cond = $state(true);
		let a = $state("a");
		let b = $state("b");
		let c = $derived.by(() => {
			console.log('computing')
			return cond ? a : b
		});

		console.log(c);
		b = "bb";
		console.log(c)
		cond = false;
		console.log(c)
		a = "aaa";
		console.log(c)
	}
</script>

<button onclick={run}>RUN THE THING</button>
