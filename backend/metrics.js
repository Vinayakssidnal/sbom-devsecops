const client = require("prom-client");

// Custom Prometheus metrics for SBOM dashboard
const sbomPackagesGauge = new client.Gauge({
    name: 'sbom_packages_total',
    help: 'Total number of packages in SBOM'
});

const vulnerabilityGauge = new client.Gauge({
    name: 'sbom_vulnerabilities_total',
    help: 'Total number of vulnerabilities by severity',
    labelNames: ['severity']
});

const scanStatusGauge = new client.Gauge({
    name: 'sbom_scan_status',
    help: 'Current scan status (0=unknown, 1=success, 2=fail)',
    labelNames: ['status']
});

module.exports = {
    sbomPackagesGauge,
    vulnerabilityGauge,
    scanStatusGauge
};