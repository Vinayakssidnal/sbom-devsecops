const {
    filterMatches,
    getLatestReport,
    getReportById,
    listReports,
    saveReport,
    summarizeMatches
} = require("../services/reportService");
const { vulnerabilityGauge, scanStatusGauge } = require("../metrics");

const uploadReport = async (req, res) => {
    try {
        const saved = await saveReport(req.body);
        if (!saved) {
            return res.status(400).json({ error: "Invalid report payload" });
        }

        return res.status(201).json({
            message: "Report stored",
            reportId: saved.fileName,
            storedAt: saved.storedAt,
            summary: saved.summary
        });
    } catch (err) {
        console.error("Error in /upload-report:", err);
        return res.status(500).json({ error: "Failed to store report" });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await listReports();
        return res.json({ reports });
    } catch (err) {
        console.error("Error in /reports:", err);
        return res.status(500).json({ error: "Failed to list reports" });
    }
};

const getFilteredReport = async (req, res) => {
    try {
        const reportId = req.query.id;
        const selectedReport = reportId ? await getReportById(reportId) : await getLatestReport();

        if (!selectedReport) {
            return res.status(404).json({ error: "No reports found" });
        }

        const matches = selectedReport.report ? (selectedReport.report.matches || selectedReport.report.vulnerabilities?.matches || []) : [];
        const filteredMatches = filterMatches(matches);
        const summary = summarizeMatches(matches);

        // Update Prometheus metrics
        vulnerabilityGauge.set({ severity: 'critical' }, summary.critical);
        vulnerabilityGauge.set({ severity: 'high' }, summary.high);
        vulnerabilityGauge.set({ severity: 'medium' }, summary.medium);
        vulnerabilityGauge.set({ severity: 'low' }, summary.low);
        if (summary.critical > 0) {
            scanStatusGauge.set({ status: 'fail' }, 1);
            scanStatusGauge.set({ status: 'success' }, 0);
        } else {
            scanStatusGauge.set({ status: 'success' }, 1);
            scanStatusGauge.set({ status: 'fail' }, 0);
        }

        return res.json({
            reportId: selectedReport.fileName,
            storedAt: selectedReport.storedAt,
            summary,
            filtered: {
                matches: filteredMatches,
                total: filteredMatches.length
            }
        });
    } catch (err) {
        console.error("Error in /filtered-report:", err);
        return res.status(500).json({ error: "Failed to filter report" });
    }
};

const getStats = async (req, res) => {
    try {
        const reportId = req.query.id;
        const report = reportId ? await getReportById(reportId) : await getLatestReport();

        if (!report) {
            return res.status(404).json({ error: "No reports found" });
        }

        const summary = summarizeMatches(report.report ? (report.report.matches || report.report.vulnerabilities?.matches || []) : []);
        const status = summary.critical > 0 ? "FAIL" : "PASS";

        return res.json({
            reportId: report.fileName,
            storedAt: report.storedAt,
            status,
            summary
        });
    } catch (err) {
        console.error("Error in /stats:", err);
        return res.status(500).json({ error: "Failed to compute stats" });
    }
};

module.exports = {
    getFilteredReport,
    getReports,
    getStats,
    uploadReport
};
