<script context="module">
		class SomeLogic {
		someValue = $state(0);
		isAboveThree = $derived(this.someValue > 3)
		trigger(){
			this.someValue++;
		}
	}

	const someLogic = new SomeLogic();
</script>

<script>
	const {log = []} = $props();

	function increment() {
		someLogic.trigger();
	}

	let localDerived = $derived(someLogic.someValue > 3);

	$effect(() => {
		log.push(someLogic.someValue);
	});
	$effect(() => {
		// Does not trigger
		log.push('class trigger ' + someLogic.isAboveThree)
	});
	$effect(() => {
		// Does Triggers
		log.push('local trigger ' + localDerived)
	});

</script>

<button on:click={increment}>
	clicks: {someLogic.someValue}
</button>
