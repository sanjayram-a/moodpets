import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @param {string} phase */
export default (phase) => ({
  reactStrictMode: true,
  // dev and production builds must not share a folder, or `next dev` can load
  // stale chunks from a previous `next build` (MODULE_NOT_FOUND './897.js')
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  outputFileTracingIncludes: {
    "/api/predict": ["./model/**"],
    "/api/about": ["./model/meta.json"],
  },
});
