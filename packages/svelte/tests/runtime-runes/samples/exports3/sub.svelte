<script>
	export const count1 = $state.frozen({value: 0}); 
	export const count2 = $state({value: 0}); 
	
	export function increment() { 
		count2.value += 1;
	}

</script>

{count1.value}
{count2.value} 

<!-- so that count1/2 become sources -->
<svelte:options accessors />
