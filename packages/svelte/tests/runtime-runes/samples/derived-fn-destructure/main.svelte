<script>
  let count = $state(0);
	function create_derived() {
		console.log('create_derived');
		return () => {
			return {
				get double() {
					return count * 2;
				}
			}
		}
	}
  let {double} = $derived.by(create_derived());
</script>

<button on:click={() => count++}>{double}</button>
