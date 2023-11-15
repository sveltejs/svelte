<script>
	function foo() {
		let x = $state(0);

		queueMicrotask(() => {
			x++;
		})

		return {
			wut() {
				return x
			}
		}
	}
	const wut = foo().wut;
	const x = $derived(wut());
</script>

<span>{x}</span>