const NodeCache = require('node-cache');

const DEFAULT_TTL = parseInt(process.env.POLL_RESULTS_CACHE_TTL, 10) || 30;
const cache = new NodeCache({ stdTTL: DEFAULT_TTL, checkperiod: Math.max(1, Math.floor(DEFAULT_TTL * 0.2)) });

module.exports = {
  get: (k) => cache.get(k),
  set: (k, v, ttl) => (typeof ttl === 'number' ? cache.set(k, v, ttl) : cache.set(k, v)),
  del: (k) => cache.del(k),
  flush: () => cache.flushAll()
};
