<script>
	import Test from './test.svelte';
</script>

<button onclick={()=>{
	const target = document.createElement('div');
	const test = new Test({
		target,
	});
	test.$on('event', () => {
		console.log('event');
	});

	target.querySelector("button").click();
}}></button>