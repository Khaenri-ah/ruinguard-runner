import { Module } from '@ruinguard/core';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import ora from 'ora';

export default async function (options) {
  const config = await fs.readFile(path.resolve('config.yml'), 'utf-8').then(data => yaml.parse(data)).catch(() => {});
  if (!config) return ora('No bot found at this location').fail();
  const cache = await fs.readFile(path.resolve('.ruincache'), 'utf-8').then(data => JSON.parse(data)).catch(() => ({}));

  const modules = options.empty
    ? []
    : await Promise.all(config.modules
      .map(m => cache[m])
      .filter(m => m)
      .map(async m => {
        const module = await import(m);
        return typeof module === 'function'
          ? module(config[module?.name] || {})
          : module;
      }));

  const registerOptions = {
    app: envConfig(config.clientID),
    token: envConfig(config.token),
    guild: config.guild,
  };

  config.guild
    ? await Module.registerGuildCommands(modules, registerOptions)
    : await Module.registerGlobalCommands(modules, registerOptions);
}

function envConfig(value) {
  if (value.startsWith('\\')) return value.slice(1);
  return value.startsWith('$') ? process.env[value.slice(1)] : value;
}