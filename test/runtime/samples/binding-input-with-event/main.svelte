<script>
	export let a;
	export let b;
</script>

<input bind:value={a} on:input='{() => b = 0}'>