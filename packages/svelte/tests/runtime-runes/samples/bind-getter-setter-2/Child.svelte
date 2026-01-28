<script>
	let div = $state();

	$effect(() => {
		console.log(div?.textContent);
	})

	export const someData = '123';
</script>

<div bind:this={() => div, v => div = v}>123</div>
