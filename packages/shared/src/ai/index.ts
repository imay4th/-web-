export { getRollDistribution, getAllKeepMasks } from './probability.js';
export { computeExpectedValue, getBestAdjustedScore, getAvailableCategories } from './expected-value.js';
export { createNpcStrategy } from './npc-strategy.js';
export type { NpcDecision, NpcStrategy } from './npc-strategy.js';
export {
  solveOptimalTable,
  serializeTable,
  deserializeTable,
  lookupValue,
  OPTIMAL_CATEGORIES,
  OPTIMAL_UPPER_SUB_SIZE,
} from './optimal-solver.js';
export type { SolverProgress } from './optimal-solver.js';
export {
  initOptimalTable,
  getOptimalTable,
  isOptimalTableLoaded,
} from './optimal-table-loader.js';
