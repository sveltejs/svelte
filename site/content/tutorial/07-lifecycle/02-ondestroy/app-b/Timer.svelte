<script>
	import { onInterval } from './utils.js';

	export let callback;
	export let interval = 1000;

	onInterval(callback, interval);
</script>

<p>
	This component executes a callback every 
	{interval} millisecond{interval === 1 ? '' : 's'}
</p>

<style>
	p { 
		border: 1px solid blue;
		padding: 5px;
	}
</style>
