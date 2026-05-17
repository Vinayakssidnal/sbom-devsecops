const fs = require("fs/promises");
const path = require("path");

const REPORTS_DIR = path.join(__dirname, "..", "..", "reports");
const ALLOWED_SEVERITIES = new Set(["Critical", "High"]);

const ensureReportsDir = async () => {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
};

const pad = (value) => String(value).padStart(2, "0");

const formatTimestamp = (date = new Date()) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

const extractMatches = (report) => {
    if (Array.isArray(report?.matches)) {
        return report.matches;
    }
    if (Array.isArray(report?.vulnerabilities?.matches)) {
        return report.vulnerabilities.matches;
    }
    return [];
};

const summarizeMatches = (matches) => {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    matches.forEach((match) => {
        const severity = match?.vulnerability?.severity;
        if (severity === "Critical") critical += 1;
        else if (severity === "High") high += 1;
        else if (severity === "Medium") medium += 1;
        else if (severity === "Low") low += 1;
    });

    return {
        critical,
        high,
        medium,
        low,
        total: matches.length
    };
};

const normalizeReportPayload = (payload) => {
    if (payload && typeof payload === "object") {
        return payload.report && typeof payload.report === "object" ? payload.report : payload;
    }
    return null;
};

const buildStoredReport = (report, storedAt) => {
    const matches = extractMatches(report);
    const summary = summarizeMatches(matches);

    return {
        storedAt,
        summary,
        report
    };
};

const saveReport = async (payload) => {
    const report = normalizeReportPayload(payload);
    if (!report) {
        return null;
    }

    await ensureReportsDir();

    const timestamp = formatTimestamp();
    const fileName = `report-${timestamp}.json`;
    const storedAt = new Date().toISOString();

    const storedReport = buildStoredReport(report, storedAt);
    const filePath = path.join(REPORTS_DIR, fileName);

    await fs.writeFile(filePath, JSON.stringify(storedReport, null, 2), "utf8");

    return {
        fileName,
        storedAt,
        summary: storedReport.summary
    };
};

const readReportFile = async (fileName) => {
    const safeName = path.basename(fileName);
    const filePath = path.join(REPORTS_DIR, safeName);
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);

    if (data && data.report) {
        return {
            fileName: safeName,
            storedAt: data.storedAt,
            summary: data.summary || summarizeMatches(extractMatches(data.report)),
            report: data.report
        };
    }

    return {
        fileName: safeName,
        storedAt: (await fs.stat(filePath)).mtime.toISOString(),
        summary: summarizeMatches(extractMatches(data)),
        report: data
    };
};

const listReports = async () => {
    await ensureReportsDir();
    const files = await fs.readdir(REPORTS_DIR);

    const reportFiles = files.filter((file) => file.endsWith(".json"));
    const reports = [];

    for (const fileName of reportFiles) {
        try {
            const parsed = await readReportFile(fileName);
            reports.push({
                fileName: parsed.fileName,
                storedAt: parsed.storedAt,
                summary: parsed.summary
            });
        } catch (err) {
            console.warn(`Skipping report ${fileName}:`, err.message);
        }
    }

    return reports.sort((a, b) => (a.storedAt < b.storedAt ? 1 : -1));
};

const getLatestReport = async () => {
    const reports = await listReports();
    if (reports.length === 0) {
        return null;
    }

    return readReportFile(reports[0].fileName);
};

const getReportById = async (fileName) => {
    await ensureReportsDir();
    return readReportFile(fileName);
};

const filterMatches = (matches, severities = ALLOWED_SEVERITIES) => {
    return matches.filter((match) => severities.has(match?.vulnerability?.severity))
        .map((match) => ({
            ...match,
            // Add mock package information for demo purposes
            // In a real implementation, this would come from the vulnerability scan
            artifact: match.artifact || {
                name: getMockPackageName(match.vulnerability.id),
                version: getMockVersion(match.vulnerability.id),
                type: "npm"
            },
            fix: match.fix || {
                versions: ["1.2.3"]
            }
        }));
};

// Mock package data for demo - in real implementation this would be from scan results
const getMockPackageName = (cveId) => {
    const mockPackages = {
        "CVE-1234": "express",
        "CVE-5678": "lodash"
    };
    return mockPackages[cveId] || "Unknown package";
};

const getMockVersion = (cveId) => {
    const mockVersions = {
        "CVE-1234": "4.17.1",
        "CVE-5678": "4.17.11"
    };
    return mockVersions[cveId] || "1.0.0";
};

module.exports = {
    filterMatches,
    getLatestReport,
    getReportById,
    listReports,
    saveReport,
    summarizeMatches
};
