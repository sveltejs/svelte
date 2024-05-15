<script>
	import { beforeUpdate, afterUpdate } from "svelte";

	export let a;
	export let b;

	beforeUpdate(() => {
		console.log('before');
	});

	beforeUpdate(()=>{
		console.log(`before ${a}, ${b}`);
	});

	afterUpdate(() => {
		console.log('after');
	});

	afterUpdate(()=>{
		console.log(`after ${a}, ${b}`);
	});
</script>

<p>a: {a}</p>
