import { EnableSourcemap } from '../../interfaces';

export default function check_enable_sourcemap(
  enable_sourcemap: EnableSourcemap,
  namespace: keyof Extract<EnableSourcemap, object>
) {
  return typeof enable_sourcemap === 'boolean'
    ? enable_sourcemap
    : enable_sourcemap[namespace];
}
