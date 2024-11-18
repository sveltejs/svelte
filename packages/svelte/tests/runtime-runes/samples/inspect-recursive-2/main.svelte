<script>
	class A {
		toJSON(){
			return {
				a: this
			}
		}
	}
	const state = $state(new A());
	$inspect(state);
</script>
