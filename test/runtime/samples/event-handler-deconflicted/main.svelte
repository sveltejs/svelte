<script>
	export let foo;
	export let click_handler;
</script>

<button on:click="{() => foo()}">{click_handler}</button>