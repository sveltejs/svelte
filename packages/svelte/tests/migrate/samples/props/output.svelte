<script>
    
    
    
    let { readonly, optional = 'foo', binding = $bindable(), bindingOptional = $bindable('bar') } = $props();
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />