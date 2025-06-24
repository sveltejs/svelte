<script>
	function test(){
		let count = $state(0);
		
		return {
			get count(){
				return count;
			},
			set count(c){
				count = c
			}
		};
	}

	let derived_count = $derived(test().count);
</script>

{derived_count}