#!/usr/bin/env node

const runCommand = require('../src/runCommand')
const configCommand = require('../src/configCommand')

/* eslint-disable no-unused-expressions */
// above needed for this side effecty thing
require('yargs')
  .command(runCommand)
  .command(configCommand)
  .demandCommand()
  .help()
  .argv
