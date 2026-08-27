<script>
    function is_red() {
        console.log("is_red()");
        return "red";
    }

    let active = $state(false);
</script>
<button onclick={() => active = true}>click</button>
<div class:red={is_red()} class:active></div>