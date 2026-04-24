/**
 * In-memory cache for frequently accessed stats
 * Prevents repeated database count queries
 * TTL: 3-5 seconds (balance between freshness and performance)
 */

class StatsCache {
  constructor(ttl = 5000) {
    this.cache = new Map();
    this.ttl = ttl;
    this.timers = new Map();
  }

  set(key, value) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, value);

    // Auto-expire after TTL
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, this.ttl);

    this.timers.set(key, timer);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  invalidate(pattern) {
    // Invalidate cache entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
      }
    }
  }
}

module.exports = new StatsCache(5000); // 5 second TTL
