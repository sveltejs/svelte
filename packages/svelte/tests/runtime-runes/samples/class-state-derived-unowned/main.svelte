<script context="module">
	class SomeLogic {
		someValue = $state(0);
		isAboveThree = $derived(this.someValue > 3);
		trigger() {
			this.someValue++;
		}
	}

	const someLogic = new SomeLogic();
</script>

<script>
	import { log } from './log.js';

	function increment() {
		someLogic.trigger();
	}

	let localDerived = $derived(someLogic.someValue > 3);

	$effect(() => {
		log.push(someLogic.someValue);
	});
	$effect(() => {
		log.push('class trigger ' + someLogic.isAboveThree)
	});
	$effect(() => {
		log.push('local trigger ' + localDerived)
	});

</script>

<button on:click={increment}>
	clicks: {someLogic.someValue}
</button>
