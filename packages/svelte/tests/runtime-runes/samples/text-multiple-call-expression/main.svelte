<script>
	import { log } from './log.js';

	let x = $state(0);
	let y = $state(0);

	function getX() {
		log.push('x')
		return x;
	}

	function getY() {
		log.push('y')
		return y;
	}
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>

{getX()}|{getY()}
