import { roles as rolesMap } from 'aria-query';

const roles = [...rolesMap.keys()];

const noninteractive_roles = new Set(roles
  .filter((name) => !rolesMap.get(name).abstract)
  .filter((name) => !rolesMap.get(name).superClass.some((c) => c.includes('widget'))));

export { noninteractive_roles };
