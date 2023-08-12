<script>
	export let clickHandlerOne = 0;
	export let clickHandlerTwo = 0;
	let f1;
	let f2;

	f1 = () => clickHandlerOne++;
	f2 = () => clickHandlerTwo++;
</script>

<button on:click='{f1}' on:click='{f2}'>click me</button>
