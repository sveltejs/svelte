<script>
	import { counter } from './stores.js';
	import Incrementer from './Incrementer.svelte';
	import Decrementer from './Decrementer.svelte';
	import Resetter from './Resetter.svelte';

	let counterValue;

	counter.subscribe(value => {
		counterValue = value;
	});
</script>

<h1>The counter is {counterValue}</h1>

<Incrementer/>
<Decrementer/>
<Resetter/>
