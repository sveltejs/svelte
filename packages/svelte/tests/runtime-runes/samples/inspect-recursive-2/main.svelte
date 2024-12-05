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

	class B {
		toJSON(){
			return {
				a: {
					b: this
				}
			}
		}
	}
	const state2 = $state(new B());
	$inspect(state2);
</script>
