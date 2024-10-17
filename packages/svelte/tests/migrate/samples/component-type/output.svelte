<script lang="ts">
	import Component from "./Component.svelte";
	import type ComponentType from "./Component.svelte";


	interface Props {
		my_comp: ReturnType<typeof Component>;
		my_component_type: ReturnType<typeof ComponentType>;
	}

	let { my_comp, my_component_type }: Props = $props();

	export function enhance(comp: ReturnType<typeof Component>, comp_type: ReturnType<typeof ComponentType>){
		
	}

	let comp: ReturnType<typeof Component> | ReturnType<typeof ComponentType> | undefined = $state(undefined);
	
	export const the_comp: ReturnType<typeof Component> | ReturnType<typeof ComponentType> = comp;
</script>

<Component bind:this={comp} />