/* eslint-env node */

/**
 * Metrics tracking utility
 */
class MetricsTracker {
  constructor() {
    this.metrics = {
      requests: 0,
      successfulParses: 0,
      failedParses: 0,
      startTime: new Date().toISOString(),
      uptime: 0
    };

    // Update uptime every minute
    this.uptimeInterval = setInterval(() => {
      this.metrics.uptime = Math.floor((Date.now() - new Date(this.metrics.startTime).getTime()) / 1000);
    }, 60000);
  }

  /**
   * Increment request counter
   */
  incrementRequests() {
    this.metrics.requests++;
  }

  /**
   * Increment successful parse counter
   */
  incrementSuccessfulParses() {
    this.metrics.successfulParses++;
  }

  /**
   * Increment failed parse counter
   */
  incrementFailedParses() {
    this.metrics.failedParses++;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.requests > 0 
        ? ((this.metrics.successfulParses / this.metrics.requests) * 100).toFixed(2) + '%' 
        : '0%',
      averageRequestsPerMinute: this.metrics.uptime > 0 
        ? (this.metrics.requests / (this.metrics.uptime / 60)).toFixed(2) 
        : '0'
    };
  }

  /**
   * Get health metrics
   */
  getHealthMetrics() {
    const metrics = this.getMetrics();
    return {
      totalRequests: metrics.requests,
      successfulParses: metrics.successfulParses,
      failedParses: metrics.failedParses,
      successRate: metrics.successRate
    };
  }

  /**
   * Get detailed metrics with system info
   */
  getDetailedMetrics() {
    const metrics = this.getMetrics();
    return {
      service: 'readability-server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      startTime: metrics.startTime,
      metrics: {
        totalRequests: metrics.requests,
        successfulParses: metrics.successfulParses,
        failedParses: metrics.failedParses,
        successRate: metrics.successRate,
        averageRequestsPerMinute: metrics.averageRequestsPerMinute
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }

  /**
   * Cleanup method to clear intervals
   */
  cleanup() {
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
    }
  }
}

// Create singleton instance
const metricsTracker = new MetricsTracker();

module.exports = metricsTracker;
