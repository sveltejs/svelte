<script lang="ts">
    export let foo: string;
</script>

<button {foo} {...$$restProps}>click me</button>
