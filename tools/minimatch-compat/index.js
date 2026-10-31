'use strict'

// minimatch@<10 exported the matcher function itself (`require('minimatch')(path, glob)`),
// minimatch@>=10 exports it as a named export only. This shim restores the old shape on
// top of the patched release so consumers that cannot be upgraded keep working.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS shim, consumed via require()
const patched = require('minimatch-patched')

module.exports = Object.assign(patched.minimatch, patched, {
  default: patched.minimatch,
})
