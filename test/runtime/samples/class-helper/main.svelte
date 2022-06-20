<script>
  export let user;

  function isActive(user) {
  return user.active;
}
</script>

<div class:active={isActive(user)}></div>