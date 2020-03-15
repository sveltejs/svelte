<script>
	import Outer from "./Outer.svelte";
	import Inner from "./Inner.svelte";
	import {model} from "./store.svelte";

	export let props = '';
	export let fallback = '';

	export function getSubscriberCount() {
		return model.getCount();
	}
</script>

<Outer slotProps={props} defaultValue={fallback} let:slotProps>    
	<Inner value={slotProps} />
</Outer>

<Outer slotProps={props} defaultValue={fallback} let:slotProps>    
	<Inner value={slotProps} />
</Outer>

<Outer slotProps={props} defaultValue={fallback}>
</Outer>
