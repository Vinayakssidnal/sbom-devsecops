const express = require("express");
const cors = require("cors");
const path = require("path");
const client = require("prom-client");
const { sbomPackagesGauge, vulnerabilityGauge, scanStatusGauge } = require("./metrics");
const analyzeRoutes = require("./routes/analyzeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const sbomRoutes = require("./routes/sbomRoutes");


const app = express();
const PORT = process.env.PORT || 4000;

// Prometheus: collect default Node.js process metrics.
client.collectDefaultMetrics();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dashboard", "index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dashboard", "index.html"));
});

app.get("/api", (req, res) => {
    res.json({
        message: "SBOM DevSecOps API",
        endpoints: ["/api/analyze", "/api/reports", "/api/sbom"]
    });
});

// Prometheus: expose metrics endpoint for scraping.
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.send(await client.register.metrics());
});

app.use("/dashboard", express.static(path.join(__dirname, "..", "dashboard")));
app.use("/api", analyzeRoutes);
app.use("/api", reportRoutes);
app.use("/api", sbomRoutes);

module.exports = app;
