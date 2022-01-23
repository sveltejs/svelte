<script>
	import { counter } from './stores.js';
</script>

<h1>The counter is {$counter}</h1>

<button on:click={counter.increment}>+</button>
<button on:click={counter.decrement}>-</button>
<button on:click={counter.reset}>reset</button>