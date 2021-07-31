<script>
    import Wrapper from "./wrapper.svelte";
    import Child from "./child.svelte";
    import { onError } from "svelte";

    export var error = false;

    onError(e => {
        error = true;
    });
</script>

<Wrapper>
    <Child />
</Wrapper>