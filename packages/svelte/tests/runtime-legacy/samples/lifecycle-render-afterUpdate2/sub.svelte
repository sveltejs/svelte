<script>
	import { afterUpdate } from "svelte";

	export let count;
	export let count2;

	afterUpdate(()=>{
		console.log(`after update ${count}, ${count2}`);
	});
</script>

{count}
