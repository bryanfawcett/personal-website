import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: 'zsx9erk1', dataset: 'production' },
  studioHost: 'bryans-adventures',
  deployment: {
    // The hosted Studio already deployed for this project. Pinning the id
    // makes `sanity deploy` update that one instead of creating a second.
    appId: 'ruye0ltca8t64z3aegwrkngb',
    autoUpdates: true,
  },
});
