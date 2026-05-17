const express = require("express");
const {
    getFilteredReport,
    getReports,
    getStats,
    uploadReport
} = require("../controllers/reportController");

const router = express.Router();

router.post("/upload-report", uploadReport);
router.get("/reports", getReports);
router.get("/filtered-report", getFilteredReport);
router.get("/stats", getStats);

module.exports = router;
