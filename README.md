# SBOM DevSecOps Dashboard
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Docker](https://img.shields.io/badge/Docker-Container-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326ce5)
![License](https://img.shields.io/badge/License-MIT-yellow)

A Node.js-based DevSecOps dashboard for Software Bill of Materials (SBOM) analysis and vulnerability scanning using Syft and Grype.

## Features

- **SBOM Generation**: Generate SBOMs for your projects using Syft
- **Vulnerability Scanning**: Scan for CVEs using Grype
- **Dashboard**: Web interface to view and analyze findings
- **API Endpoints**: RESTful APIs for analysis and reporting
- **Metrics**: Prometheus-compatible metrics endpoint
- **CI/CD**: Automated pipelines for build, test, scan, and deploy
- **Containerization**: Docker support with Kubernetes deployment

## Security Toolchain

| Tool | Purpose |
|---|---|
| Syft | Generates SBOM |
| Grype | Vulnerability scanning |
| Docker | Containerization |
| Kubernetes | Container orchestration |
| Prometheus | Metrics collection |
| Grafana | Monitoring dashboards |
| Jest | Automated testing |
| Supertest | API testing |

---

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker (for containerized deployment)
- Minikube
- kubectl (for Kubernetes deployment)
- GitHub account (for CI/CD workflows)
- Syft
- Grype
- Prometheus
- Grafana

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vinayakssidnal/sbom-devsecops.git
   ```
2. Go into the project folder:
   ```bash
   cd sbom-devsecops
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the server:
   ```bash
   npm start
   ```
2. Open your web browser
3. Go to the dashboard: http://localhost:4000/dashboard
4. Check API base: http://localhost:4000/api

### Generating SBOM

Generate Software Bill of Materials using Syft:

```bash
syft . -o syft-json > sbom.json
```

Expected:
- `sbom.json` generated in project root

---

### Running Vulnerability Scan

Scan project vulnerabilities using Grype:

```bash
grype . -o json > report.json
```

Expected:
- `report.json` generated in project root

---

### Testing the analyze API
1. Use POST for analyze requests with the expected JSON structure:
   ```bash
   curl -X POST http://localhost:4000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"sbom": {}, "vulnerabilities": {"matches": []}}'
   ```

### Running with Docker
1. Make sure Docker Desktop is running
2. Build the Docker image:
   ```bash
   docker build -t sbom-devsecops .
   ```
3. Run the container:
   ```bash
   docker run -p 4000:4000 sbom-devsecops
   ```
   Expected:
   ```text
   Server running on port 4000
   ```
4. Open browser to http://localhost:4000/dashboard

### Testing
1. In the project folder, run:
   ```bash
   npm test
   ```
   Expected:
   ```text
   PASS
   ```

### Dashboard Features

The dashboard provides:

- Vulnerability statistics
- High/Critical CVE findings
- SBOM package inventory
- Package metadata and licenses
- Report history
- Prometheus metrics integration

Dashboard URL:

```text
http://localhost:4000/dashboard
```

---

### API Endpoints
- API base: GET http://localhost:4000/api
- Analyze SBOM: POST http://localhost:4000/api/analyze
- Get reports: GET http://localhost:4000/api/reports
- Get SBOM: GET http://localhost:4000/api/sbom
- Metrics: GET http://localhost:4000/metrics

### Additional API Endpoints

- Vulnerability Stats: GET http://localhost:4000/api/stats
- Filtered Vulnerability Report: GET http://localhost:4000/api/filtered-report

---

> Note: `GET /api/health` is not available in this version of the app. Use `GET /api` to confirm available endpoints.
> Note: `GET /api/analyze` is not valid. Use `POST /api/analyze` with JSON payload.

### Kubernetes Deployment
1. Start Minikube:
   ```bash
   minikube start
   ```

2. Make sure kubectl is configured for your cluster

3. Load Docker image into Minikube:
   ```bash
   minikube image load sbom-devsecops
   ```

4. Apply Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/
   ```

5. Check deployment status:
   ```bash
   kubectl get pods
   kubectl get services
   ```
   Expected:
   ```text
   Running
   ```
6. Open Kubernetes service:
   ```bash
   minikube service sbom-app-service
   ```

7. View pod logs:
   ```bash
   kubectl logs -l app=sbom-app
   ```
---

### CI/CD Setup
1. Push code to GitHub repository
2. Go to repository Settings > Secrets and variables > Actions
3. Add secret `KUBE_CONFIG_DATA` (base64-encoded kubeconfig) for deployment
4. Workflows will run automatically on push to main branch
  - Deploys to Kubernetes (if `KUBE_CONFIG_DATA` secret is set)

### Setting up GitHub Secrets

For CD deployment, set these repository secrets in GitHub:

- `KUBE_CONFIG_DATA`: Base64-encoded kubeconfig for your cluster

## Monitoring and Metrics

Prometheus metrics endpoint:

```text
http://localhost:4000/metrics
```

Metrics include:
- Vulnerability metrics
- SBOM package metrics
- Node.js runtime metrics
- Scan status metrics

---

## Grafana Integration

Configure Prometheus datasource:

```text
http://localhost:9090
```

Use Grafana dashboards for:
- Vulnerability monitoring
- Application metrics
- System observability

---

## CI/CD Workflow

GitHub Actions automates:

- Dependency installation
- Automated testing
- SBOM generation
- Vulnerability scanning
- Docker image build
- Kubernetes deployment

Workflow location:

```text
.github/workflows/
```

---

## Architecture Flow

```text
Developer
   ↓
GitHub Repository
   ↓
GitHub Actions CI/CD
   ↓
SBOM Generation (Syft)
   ↓
Vulnerability Scan (Grype)
   ↓
Docker Build
   ↓
Kubernetes Deployment
   ↓
Prometheus Metrics
   ↓
Grafana Dashboard
```

---

## Project Structure

```
├── backend/                # Express.js backend APIs
│   ├── controllers/        # API controllers
│   ├── routes/             # API routes
│   └── services/           # Business logic
├── dashboard/              # Frontend dashboard
├── k8s/                   # Kubernetes manifests
├── reports/               # Vulnerability scan reports
├── sbom.json              # Generated SBOM
├── report.json            # Grype vulnerability report
├── .github/workflows/     # CI/CD pipelines
├── Dockerfile             # Container definition
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## Future Improvements

- Authentication and RBAC
- Real-time alerts
- PDF report export
- Multi-project support
- Persistent database storage
- Automated remediation suggestions

---

## License

MIT License