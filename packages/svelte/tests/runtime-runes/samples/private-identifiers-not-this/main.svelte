<script>
	class Box {
		#value = $state(0);

		get value(){
			return this.#value;
		}
		
		constructor(num){
			this.#value = num;
		}
		
		swap(other) {
			const value = this.#value;
			this.#value = other.value;
			other.#value = value;
		}
	}

	const a = new Box(42);
	const b = new Box(1337);
</script>

<p>{a.value}</p>
<p>{b.value}</p>
<button onclick={()=>{a.swap(b)}}></button>