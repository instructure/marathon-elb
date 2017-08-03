#!/usr/bin/env node

const yargs = require('yargs')
const runCommand = require('../src/runCommand')
const configCommand = require('../src/configCommand')

yargs
  .command(runCommand)
  .command(configCommand)
  .demandCommand()
  .help()
  .argv
