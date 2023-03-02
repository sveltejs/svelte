<script>
	let foo = 'a';
</script>

<div on:click="{() => foo = 'b'}">
	<slot name="main" {foo}></slot>
</div>