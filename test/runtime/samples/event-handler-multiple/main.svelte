<script>
	export let clickHandlerOne = 0;
	export let clickHandlerTwo = 0;
</script>

<button on:click='{() => clickHandlerOne++}' on:click='{() => clickHandlerTwo++}'>click me</button>
