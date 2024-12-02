<script>
	function run(){
		let a = $state('a');
		let b = $derived.by(() => {
			console.log('computing B', a);
			return 'foo';
		});
		let c = $derived.by(() => {
			console.log('computing C');
			return b;
		});

		console.log(c);
		a = "aaa";
		console.log(c);
	}
</script>

<button onclick={run}>RUN THE THING</button>
