<script lang="ts">
    interface Props {
        foo: string;
        [key: string]: any
    }

    let { foo, ...rest }: Props = $props();
</script>

<button {foo} {...rest}>click me</button>