<script module>
	class SomeLogic {
		trigger() {
			this.someValue++;
		}

		constructor() {
			this.someValue = $state(0);
			this.isAboveThree = $derived(this.someValue > 3);
		}
	}

	const someLogic = new SomeLogic();
</script>

<script>
	function increment() {
		someLogic.trigger();
	}

	let localDerived = $derived(someLogic.someValue > 3);

	$effect(() => {
		console.log(someLogic.someValue);
	});
	$effect(() => {
		console.log('class trigger ' + someLogic.isAboveThree)
	});
	$effect(() => {
		console.log('local trigger ' + localDerived)
	});

</script>

<button on:click={increment}>
	clicks: {someLogic.someValue}
</button>
