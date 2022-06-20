<script>
	export let obj;
	export let prop;
</script>

<input bind:value={obj[prop]}>
<pre>{JSON.stringify(obj)}</pre>