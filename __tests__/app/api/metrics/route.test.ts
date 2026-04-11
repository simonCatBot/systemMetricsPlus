// Simple tests for the metrics route
// Note: Full API tests require Node.js runtime, skip in jsdom

describe('Metrics API - Structure', () => {
  it('should have the GET handler exported', async () => {
    // We can't test the actual handler in jsdom due to NextResponse
    // But we can verify the module structure
    const route = await import('@/app/api/metrics/route');
    expect(route).toHaveProperty('GET');
    expect(typeof route.GET).toBe('function');
  });
});
