<script lang="ts">
    
    
    
    let { readonly, optional = 'foo', binding = $bindable(), bindingOptional = $bindable('bar') } : { readonly: number, optional?: string, binding: string, bindingOptional?: string | undefined } = $props();
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />