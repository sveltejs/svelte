<script>
  export let box;
</script>

<slot name="box1" {box} />
<slot name="box2" width={box.width} height={box.height} />
<slot {box} />