import 'jest';
import fastifyPlugin = require('../src/index');
import fastify = require('fastify');

const getApp = () => {
  const app = fastify();

  // Add a couple of routes to test
  app.get('/test', async () => {
    return 'get test';
  });
  app.post('/test', async () => {
    return 'post test';
  });

  // Register the plugin
  app.register(fastifyPlugin, {
    endpoint: '/metrics'
  });

  return app;
};

describe('metrics plugin', () => {
  const app = getApp();

  afterEach(async () => {
    // Reset metrics after each test
    app.metrics.client.register.resetMetrics();
  });

  afterAll(async () => {
    // Close all connections
    await app.close();
  });

  it('should register default metrics', async () => {
    await app.inject({
      method: 'GET',
      url: '/test'
    });

    await app.inject({
      method: 'POST',
      url: '/test'
    });

    const expectedMetrics = [
      // It should register histogram metrics for requests duration in seconds
      '# HELP http_request_duration_seconds request duration in seconds',
      '# TYPE http_request_duration_seconds histogram',
      // GET /test
      'http_request_duration_seconds_bucket{le="0.05",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="0.1",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="0.5",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="1",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="3",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="5",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="10",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="+Inf",method="GET",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_sum{method="GET",route="/test",status_code="200"}',
      'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
      // POST /test
      'http_request_duration_seconds_bucket{le="0.05",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="0.1",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="0.5",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="1",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="3",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="5",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="10",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_bucket{le="+Inf",method="POST",route="/test",status_code="200"} 1',
      'http_request_duration_seconds_sum{method="POST",route="/test",status_code="200"}',
      'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
      // It should register summary metrics for requests duration in seconds
      '# HELP http_request_summary_seconds request duration in seconds summary',
      '# TYPE http_request_summary_seconds summary',
      // GET /test
      'http_request_summary_seconds{quantile="0.5",method="GET",route="/test",status_code="200"}',
      'http_request_summary_seconds{quantile="0.9",method="GET",route="/test",status_code="200"}',
      'http_request_summary_seconds{quantile="0.95",method="GET",route="/test",status_code="200"}',
      'http_request_summary_seconds{quantile="0.99",method="GET",route="/test",status_code="200"}',
      'http_request_summary_seconds_sum{method="GET",route="/test",status_code="200"}',
      'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
      // POST /test
      'http_request_summary_seconds{quantile="0.5",method="POST",route="/test",status_code="200"}',
      'http_request_summary_seconds{quantile="0.9",method="POST",route="/test",status_code="200"}',
      'http_request_summary_seconds{quantile="0.95",method="POST",route="/test",status_code="200"}',
      'http_request_summary_seconds{quantile="0.99",method="POST",route="/test",status_code="200"}',
      'http_request_summary_seconds_sum{method="POST",route="/test",status_code="200"}',
      'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1'
    ];

    const metrics = await app.inject({
      method: 'GET',
      url: '/metrics'
    });

    expectedMetrics.forEach(metric => {
      expect(metrics.payload).toContain(metric);
    });
  });

  it('should register default metrics for 4xx request', async () => {
    await app.inject({
      method: 'GET',
      url: '/not-exists'
    });

    const expectedMetrics = [
      // It should register histogram metrics for requests duration in seconds
      '# HELP http_request_duration_seconds request duration in seconds',
      '# TYPE http_request_duration_seconds histogram',
      'http_request_duration_seconds_bucket{le="0.05",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_bucket{le="0.1",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_bucket{le="0.5",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_bucket{le="1",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_bucket{le="3",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_bucket{le="5",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_bucket{le="10",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_bucket{le="+Inf",method="GET",route="/not-exists",status_code="404"} 1',
      'http_request_duration_seconds_sum{method="GET",route="/not-exists",status_code="404"}',
      'http_request_duration_seconds_count{method="GET",route="/not-exists",status_code="404"} 1',
      // It should register summary metrics for requests duration in seconds
      '# HELP http_request_summary_seconds request duration in seconds summary',
      '# TYPE http_request_summary_seconds summary',
      'http_request_summary_seconds{quantile="0.5",method="GET",route="/not-exists",status_code="404"}',
      'http_request_summary_seconds{quantile="0.9",method="GET",route="/not-exists",status_code="404"}',
      'http_request_summary_seconds{quantile="0.95",method="GET",route="/not-exists",status_code="404"}',
      'http_request_summary_seconds{quantile="0.99",method="GET",route="/not-exists",status_code="404"}',
      'http_request_summary_seconds_sum{method="GET",route="/not-exists",status_code="404"}',
      'http_request_summary_seconds_count{method="GET",route="/not-exists",status_code="404"} 1'
    ];

    const metrics = await app.inject({
      method: 'GET',
      url: '/metrics'
    });

    expectedMetrics.forEach(metric => {
      expect(metrics.payload).toContain(metric);
    });
  });
});
