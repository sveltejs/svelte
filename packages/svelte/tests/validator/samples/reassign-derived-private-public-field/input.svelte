<script>
	class Test {
	  #deps = () => [];
	
	  deps = $derived.by(() => {
		return [];
	  });		
			
	  constructor(f = () => []) {
		this.#deps = f;
	  }
	}
  </script>