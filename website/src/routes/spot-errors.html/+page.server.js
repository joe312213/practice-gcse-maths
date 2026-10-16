/** Load the isolated, authored lattice prototype; no learner data is read or written. */
import prototype from '../../../../content/lattice_error_prototype.json' with { type: 'json' };
export function load() {
  return prototype;
}
