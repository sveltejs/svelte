default slot: <slot />
named slot: <slot name="my-slot" />
slot with default content: <slot name="slot-with-content">default content</slot>
another slot with content: <slot name="another-slot-with-content">default content</slot>
slot with content from nested: <slot name="slot-with-content-from-nested">default content</slot>
{#if is_slot_visible}
	conditional slot: <slot name="conditional-slot" />
	conditional slot with content: <slot name="conditional-slot-with-content">default content</slot>
{/if}
<script>
export let is_slot_visible = true;
</script>
