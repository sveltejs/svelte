<script>
	export let a = { b: [1] };

	const identity = x => x;
</script>

{a.b}-{identity(a.b)}
