const request = require('supertest');
const app = require('../backend/app');

describe('SBOM DevSecOps API', () => {
    it('should return dashboard HTML on GET /', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    it('should return metrics on GET /metrics', async () => {
        const response = await request(app).get('/metrics');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/plain/);
        expect(response.text).toContain('sbom_packages_total');
    });

    it('should return SBOM data on GET /api/sbom', async () => {
        const response = await request(app).get('/api/sbom');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('packages');
        expect(response.body).toHaveProperty('totalPackages');
    });
});