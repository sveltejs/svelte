<script>
  import Child from './Child.svelte'
  export let user;

  function isActive(user) {
    return user.active;
  }
</script>

<Child class:active={isActive(user)}></Child>
