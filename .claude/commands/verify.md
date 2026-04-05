Run the following commands in order (same as `npm run pipeline:check`):

1. `npm run lint`
2. `npm run format:check`
3. `npm run type-check`
4. `npm run test:coverage`
5. `npm run test:e2e`
6. `npm run build`

If any step fails, fix the issues and re-run from that step (or re-run the full pipeline).

Do not consider the current task complete until all six pass cleanly.
