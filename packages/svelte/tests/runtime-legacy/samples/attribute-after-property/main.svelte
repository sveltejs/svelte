<script>
    let step = "any";
</script>

<input type="range" {...{step}} />
<button onclick={() => step = step === "any" ? 10 : "any"}>change step</button>