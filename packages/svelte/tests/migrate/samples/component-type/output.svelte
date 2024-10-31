<script lang="ts">
	import Component from "./Component.svelte";
	import type ComponentType from "./Component.svelte";


	interface Props {
		my_comp: import('svelte').ComponentExports<typeof Component>;
		my_component_type: import('svelte').ComponentExports<typeof ComponentType>;
	}

	let { my_comp, my_component_type }: Props = $props();

	export function enhance(comp: import('svelte').ComponentExports<typeof Component>, comp_type: import('svelte').ComponentExports<typeof ComponentType>){
		
	}

	let comp: import('svelte').ComponentExports<typeof Component> | import('svelte').ComponentExports<typeof ComponentType> | undefined = $state(undefined);
	
	export const the_comp: import('svelte').ComponentExports<typeof Component> | import('svelte').ComponentExports<typeof ComponentType> = comp;
</script>

<Component bind:this={comp} />