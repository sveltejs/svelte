<script>
	import { counter } from './stores.js';
	import Incrementer from './Incrementer.svelte';
	import Decrementer from './Decrementer.svelte';
	import Resetter from './Resetter.svelte';
</script>

<h1>The counter is {$counter}</h1>

<Incrementer/>
<Decrementer/>
<Resetter/>