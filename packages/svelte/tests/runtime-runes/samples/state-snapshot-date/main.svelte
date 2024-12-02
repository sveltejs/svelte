<script>
	let test = $state({
		a: new Date()
	});
	let test2 = $state.snapshot(test);

	let test3 = {
		a: new Date()
	}
	let test4 = structuredClone(test3);
</script>

{test.a instanceof Date}
{test2.a instanceof Date}
{test3.a instanceof Date}
{test4.a instanceof Date}
