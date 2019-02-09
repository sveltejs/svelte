<script>
	export let a;
	export let b;

	function c() {
		return a + b;
	}

	function cSquared() {
		return c() * c();
	}
</script>

<p>{a} + {b} = {c()}</p>
<p>{c()} * {c()} = {cSquared()}</p>
