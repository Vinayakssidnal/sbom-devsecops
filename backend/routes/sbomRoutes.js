const express = require("express");
const fs = require("fs");
const path = require("path");
const { sbomPackagesGauge } = require("../metrics");

const router = express.Router();
const sbomPath = path.join(__dirname, "..", "..", "sbom.json");

router.get("/sbom", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(sbomPath, "utf8"));

        // Update Prometheus metrics
        sbomPackagesGauge.set(data.artifacts?.length || 0);

        res.json({
            totalPackages: data.artifacts?.length || 0,
            packages: data.artifacts?.slice(0, 10) || []
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Unable to load SBOM"
        });
    }
});

module.exports = router;