<script lang="ts">
	import Component from "./Component.svelte";
	import type ComponentType from "./Component.svelte";

	export let my_comp: Component;

	export let my_component_type: ComponentType;

	export function enhance(comp: Component, comp_type: ComponentType){
		
	}

	let comp: Component | ComponentType | undefined = undefined;
	
	export const the_comp: Component | ComponentType = comp;
</script>

<Component bind:this={comp} />