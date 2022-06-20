<script>
	export let foo = false;
	export let bar = false;
</script>

<div on:click='{() => foo = true}'>
	<button class='allow-propagation'>click me</button>
</div>

<div on:click='{() => bar = true}'>
	<button class='stop-propagation' on:click='{event => event.stopPropagation()}'>click me</button>
</div>
