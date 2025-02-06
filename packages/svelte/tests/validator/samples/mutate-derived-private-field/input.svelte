<script>
	class Test{
		#der = $derived({test: 0});

		set test(v){
			this.#der.test = 45;
		}
	}
</script>