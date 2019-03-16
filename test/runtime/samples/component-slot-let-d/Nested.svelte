<script>
	let foo = 'a';
</script>

<div on:click="{() => foo = 'b'}">
	<slot {foo}></slot>
</div>