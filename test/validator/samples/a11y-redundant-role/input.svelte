<!-- valid -->
<div />
<button role="main" />
<MyComponent role="button" />
<button role={`${foo}button`} />
<nav role="navigation" />
<!-- invalid -->
<button role="button" />
<body role="document" />

<script>
  let MyComponent, foo;
</script>