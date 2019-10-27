/**
 * Math.js exported with custom bundling.
 * SEE: https://github.com/josdejong/mathjs/blob/2b95c65a30a84cdd0d48a3994e194ea339ef9c87/docs/custom_bundling.md
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/math
 */

import { create, all } from 'mathjs'

const math = create(
  { all },
  {
    matrix: 'Array',
    number: 'BigNumber',
    precision: 32
  }
)

export default math
