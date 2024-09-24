<script>
    let foo = $state({ count: 0 });
    let count = $state(0);

    function action() {
        return {
            update(foo) {
                count = foo.count;
            }
        }
    }
</script>

<button onclick={() => foo.count++}>mutate</button>
<button onclick={() => foo = {...foo, count: foo.count + 1 }}>reassign</button>
<div use:action={foo}>{count}</div>
