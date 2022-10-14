<script>
	const immutable = 0;

	const obj1 = { prop: true };
	const obj2 = { prop: 0 }
</script>

<!-- should not error -->
<button on:click={() => obj1.prop = false}>click</button>
<button on:click={() => obj2.prop++}>click</button>

<!-- should error -->
<button on:click={() => immutable++}>click</button>


