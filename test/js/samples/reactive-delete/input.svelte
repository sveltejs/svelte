<script>
	const a = { b: true };

	export function removeB() {
		delete a.b;
	}

	$: console.log(a.b);
</script>
