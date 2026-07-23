<script>
    function makeColor() {
        console.log("makeColor()");
        return "red";
    }

    let size = $state('1em');
</script>
<button onclick={() => size = '2em'}>click</button>
<div style:background-color={makeColor()} style:font-size={size}></div>