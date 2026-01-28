<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
    // script tag but no lang="ts", because for example only imports present
</script>

{@render children?.()}