<script>
	import {afterUpdate} from 'svelte'
	import {writable} from 'svelte/store'
	
	const normal = writable(0);
	const modifier = writable(0);
	export let updated = 0;
	export const lists = writable([]);
	
	const click = (e, type) => {
		if(type === 'normal'){
			$normal ++;
		}else{
			$modifier ++;
		}
	}
	afterUpdate(() => updated++);

	export function getNormalCount() {
		return $normal;
	}
	export function getModifierCount() {
		return $modifier;
	}
</script>

{#each $lists as item (item.text)}
	<div>
		{item.text}
		<button on:click={(e)=>click(e,'normal')}>
			Normal
		</button>
		<button on:click|preventDefault={(e)=> click(e,'modifier')}>
			Modifier
		</button>
	</div>
{/each}
