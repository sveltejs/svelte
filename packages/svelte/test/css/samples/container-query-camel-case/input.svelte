<h1 class="main">hello</h1>

<style lang="css">
  .main {
    container-name: myContainer;
    container-type: inline-size;
  }
  @container myContainer (min-width: 300px) {
    h1 {
      color: red;
    }
  }
</style>