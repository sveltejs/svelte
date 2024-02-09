<script>
	import { beforeUpdate, afterUpdate } from "svelte";
	import { log } from './log.js';

	export let a;
	export let b;

	beforeUpdate(() => {
		log.push('before');
	});

	beforeUpdate(()=>{
		log.push(`before ${a}, ${b}`);
	});

	afterUpdate(() => {
		log.push('after');
	});

	afterUpdate(()=>{
		log.push(`after ${a}, ${b}`);
	});
</script>

<p>a: {a}</p>
