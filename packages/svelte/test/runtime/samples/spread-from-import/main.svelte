<script>
	import { spread } from './spread.js';
	let dynamic = 'dynamic';
</script>

<div>
	<p {...spread()}>static stuff</p>
</div>

<div>
	<p {...spread()}>{dynamic} stuff</p>
</div>

<button on:click={() => dynamic = ''}>unused</button>
