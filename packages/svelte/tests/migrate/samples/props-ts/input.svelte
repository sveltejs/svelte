<script lang="ts">
    export let readonly: number;
    export let optional = 'foo';
    export let binding: string;
    export let bindingOptional: string | undefined = 'bar';
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />
