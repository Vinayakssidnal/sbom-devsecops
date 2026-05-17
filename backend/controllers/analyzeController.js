const { analyzeData } = require("../services/analyzeService");

const analyze = (req, res) => {
    try {
        const { sbom, vulnerabilities } = req.body || {};

        if (!sbom || !vulnerabilities || !Array.isArray(vulnerabilities.matches)) {
            return res.status(400).json({
                error: "Invalid input format"
            });
        }

        const result = analyzeData(sbom, vulnerabilities);
        return res.json(result);

    } catch (err) {
        console.error("Error in /analyze:", err);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

module.exports = { analyze };