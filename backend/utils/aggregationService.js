const Vote = require('../SchemaModels/votes');
const NodeCache = require('node-cache');

// Cache with 5 minute TTL (time to live)
const resultsCache = new NodeCache({ stdTTL: 300 });

/**
 * Aggregates votes for a specific poll
 * @param {String} pollId - The ID of the poll
 * @param {Boolean} useCache - Whether to use cached results if available
 * @returns {Object} Aggregated vote counts and percentages
 */
const aggregatePollResults = async (pollId, useCache = true) => {
  // Check cache first if enabled
  const cacheKey = `poll_results_${pollId}`;
  if (useCache && resultsCache.has(cacheKey)) {
    return resultsCache.get(cacheKey);
  }

  try {
    // Get all votes for this poll
    const votes = await Vote.find({ poll_id: pollId });
    
    if (!votes || votes.length === 0) {
      return { counts: {}, percentages: {}, total: 0 };
    }

    // Count votes by option
    const counts = {};
    votes.forEach(vote => {
      const option = vote.selected_option;
      counts[option] = (counts[option] || 0) + 1;
    });

    // Calculate percentages
    const total = votes.length;
    const percentages = {};
    
    Object.keys(counts).forEach(option => {
      percentages[option] = Math.round((counts[option] / total) * 100);
    });

    // Format the results in a graph-friendly format
    const results = {
      counts,
      percentages,
      total
    };

    // Cache the results
    if (useCache) {
      resultsCache.set(cacheKey, results);
    }

    return results;
  } catch (error) {
    console.error('Error aggregating poll results:', error);
    throw error;
  }
};

/**
 * Invalidates the cache for a specific poll
 * @param {String} pollId - The ID of the poll
 */
const invalidateCache = (pollId) => {
  const cacheKey = `poll_results_${pollId}`;
  resultsCache.del(cacheKey);
};

module.exports = {
  aggregatePollResults,
  invalidateCache
};