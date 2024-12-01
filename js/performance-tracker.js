// Performance Tracking Module
class PerformanceTracker {
    constructor(options = {}) {
        this.options = {
            remoteLogging: false,
            loggingEndpoint: null,
            ...options
        };

        this.metrics = {
            pageLoadTime: null,
            firstContentfulPaint: null,
            timeToInteractive: null,
            navigationTiming: null,
            resourceLoadTimes: []
        };

        this.initTracking();
    }

    initTracking() {
        // Capture navigation timing
        if ('performance' in window) {
            this.metrics.navigationTiming = performance.getEntriesByType('navigation')[0]?.toJSON();
            
            // Track resource load times
            const resourceEntries = performance.getEntriesByType('resource');
            this.metrics.resourceLoadTimes = resourceEntries.map(entry => ({
                name: entry.name,
                duration: entry.duration,
                initiatorType: entry.initiatorType
            }));
        }

        // Track page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.metrics.pageLoadTime = loadTime;
            this.sendPerformanceData();
        });

        // Performance Observer for detailed metrics
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    switch(entry.entryType) {
                        case 'paint':
                            if (entry.name === 'first-contentful-paint') {
                                this.metrics.firstContentfulPaint = entry.startTime;
                            }
                            break;
                        case 'longtask':
                            console.warn('Long task detected:', entry);
                            break;
                    }
                }
            });

            observer.observe({
                entryTypes: ['paint', 'longtask']
            });
        }
    }

    sendPerformanceData() {
        console.log('Performance Metrics:', this.metrics);

        // Optional remote logging
        if (this.options.remoteLogging && this.options.loggingEndpoint) {
            try {
                fetch(this.options.loggingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        url: window.location.href,
                        metrics: this.metrics
                    })
                }).catch(error => {
                    console.error('Performance logging failed:', error);
                });
            } catch (error) {
                console.error('Error sending performance data:', error);
            }
        }
    }

    // Expose metrics for external use
    getMetrics() {
        return { ...this.metrics };
    }

    // Analyze and provide performance insights
    getPerformanceInsights() {
        const insights = [];

        if (this.metrics.pageLoadTime > 3000) {
            insights.push('Page load time is high. Consider optimizing assets.');
        }

        const longResources = this.metrics.resourceLoadTimes.filter(r => r.duration > 500);
        if (longResources.length > 0) {
            insights.push(`${longResources.length} resources take longer than 500ms to load.`);
        }

        return insights;
    }
}

// Initialize tracker with optional remote logging
const performanceTracker = new PerformanceTracker({
    remoteLogging: false  // Set to true if you have a logging endpoint
    // loggingEndpoint: 'https://your-logging-service.com/performance'
});

export default performanceTracker;
