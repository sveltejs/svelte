<!-- svelte-ignore a11y_missing_attribute -->
<a>
  <b>
    <c>
      <span>
        Big red Comic Sans
      </span>
      <span class='foo'>
        Big red Comic Sans
      </span>
    </c>
  </b>
</a>

<style>
  a b c span {
    color: red;
    font-size: 2em;
    font-family: 'Comic Sans MS';
  }
  .foo {
    color: green;
  }
</style>
