<script>
  export let a, b, c;
</script>

<div class="foo{a ? ' aa' : b ? ' bb ' : c ? 'cc ' : 'dd'}bar baz {a ? ' aa' : b ? ' bb ' : c ? 'cc ' : 'dd'}">
  some stuff
</div>

<style>
  .foo {color: red;}
  .fooaa {color: red;}
  .foobb {color: red;}
  .foocc {color: red;}
  .foodd {color: red;}
  .aa {color: red;}
  .bb {color: red;}
  .cc {color: red;}
  .dd {color: red;}
  .aabar {color: red;}
  .bbbar {color: red;}
  .ccbar {color: red;}
  .ddbar {color: red;}
  .fooaabar {color: red;}
  .foobbbar {color: red;}
  .fooccbar {color: red;}
  .fooddbar {color: red;}
  .baz {color: red;}
  .unused {color: red;}
</style>