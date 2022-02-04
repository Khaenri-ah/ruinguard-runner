import { program } from 'commander';
import 'dotenv/config';

import start from './commands/start.js';
import register from './commands/register.js';

program
  .command('start')
  .description('start this bot')
  .action(start);

program
  .command('register')
  .description('register application commands for this bot')
  .option('-e --empty', 'register an empty array of modules, clearing registered modules')
  .action(register);

program.parseAsync(process.argv);