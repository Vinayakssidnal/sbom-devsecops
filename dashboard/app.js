const statusBadge = document.getElementById("statusBadge");
const reportMeta = document.getElementById("reportMeta");
const reportIdSummary = document.getElementById("reportIdStat");
const reportIdDetail = document.getElementById("reportId");
const lastUpdatedSummary = document.getElementById("lastUpdatedStat");
const lastUpdatedDetail = document.getElementById("lastUpdated");
const totalPackagesSummary = document.getElementById("totalPackagesStat");
const totalPackagesDetail = document.getElementById("totalPackages");
const criticalCount = document.getElementById("criticalCount");
const highCount = document.getElementById("highCount");
const mediumCount = document.getElementById("mediumCount");
const lowCount = document.getElementById("lowCount");
const findingCount = document.getElementById("findingCount");
const findingsTable = document.getElementById("findingsTable");
const packageCount = document.getElementById("packageCount");
const packageList = document.getElementById("packageList");
const reportSelector = document.getElementById("reportSelector");
const refreshBtn = document.getElementById("refreshBtn");
const findingStatus = document.getElementById("findingStatus");

let activeReportId = "";

const api = {
    reports: "/api/reports",
    stats: "/api/stats",
    filtered: "/api/filtered-report",
    sbom: "/api/sbom"
};

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const setStatus = (status) => {
    statusBadge.className = "pill";
    statusBadge.classList.add(status === "FAIL" ? "pill--fail" : "pill--pass");
    statusBadge.textContent = status === "FAIL" ? "Action required" : "Healthy";
};

const renderReportMenu = (reports) => {
    reportSelector.innerHTML = "<option value=\"\">Latest report</option>";
    reports.forEach((report) => {
        const option = document.createElement("option");
        option.value = report.fileName;
        option.textContent = `${report.fileName} — ${formatDate(report.storedAt)}`;
        reportSelector.appendChild(option);
    });
    reportSelector.value = activeReportId;
};

const renderFindings = (matches) => {
    findingsTable.innerHTML = "";
    findingStatus.className = "pill";

    if (!matches.length) {
        findingStatus.classList.add("pill--pass");
        findingStatus.textContent = "No active findings";
        findingCount.textContent = "0 high/critical findings";
        findingsTable.innerHTML = `<tr><td colspan="4"><div class="empty-state">No high or critical vulnerabilities were found in this SBOM report.</div></td></tr>`;
        return;
    }

    findingStatus.classList.add("pill--fail");
    findingStatus.textContent = `${matches.length} issue${matches.length === 1 ? "" : "s"}`;
    findingCount.textContent = `${matches.length} high/critical findings`;

    matches.slice(0, 12).forEach((match) => {
        const severity = match?.vulnerability?.severity || "Unknown";
        const id = match?.vulnerability?.id || "Unknown vulnerability";
        const artifact = match?.artifact || {};
        const packageLabel = artifact.name ? `${artifact.name} ${artifact.version || ""}`.trim() : "Unknown package";
        const fixVersion = Array.isArray(match?.fix?.versions) ? match.fix.versions[0] : "None";

        const row = document.createElement("tr");
        row.innerHTML = `
      <td><span class="pill ${severity === "Critical" ? "pill--fail" : severity === "High" ? "pill--warning" : "pill--loading"}">${severity}</span></td>
      <td>${id}</td>
      <td>${packageLabel}</td>
      <td>${fixVersion}</td>
    `;
        findingsTable.appendChild(row);
    });
};

const renderPackages = (packages, total) => {
    packageList.innerHTML = "";
    totalPackagesSummary.textContent = total != null ? total : "—";
    packageCount.textContent = total != null ? `${total} packages loaded` : "No package data";

    if (!packages.length) {
        packageList.innerHTML = `<div class="empty-state">No SBOM packages found in the current SBOM file.</div>`;
        return;
    }

    packages.forEach((pkg) => {
        const license = (pkg.licenses && pkg.licenses[0] && (pkg.licenses[0].value || pkg.licenses[0].spdxExpression)) || "License not available";
        const packageName = pkg.name || pkg.id || "Unnamed package";
        const packageVersion = pkg.version ? `Version ${pkg.version}` : pkg.purl || "";

        const item = document.createElement("div");
        item.className = "package-item";
        item.innerHTML = `
      <strong>${packageName}</strong>
      <div class="meta">${packageVersion}</div>
      <div class="meta">${pkg.type ? `Type: ${pkg.type}` : "Type: unknown"}</div>
      <div class="meta">${license}</div>
    `;
        packageList.appendChild(item);
    });
};

const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${url} failed with ${response.status}`);
    }
    return response.json();
};

const loadReports = async () => {
    try {
        const data = await fetchJson(api.reports);
        const reports = Array.isArray(data.reports) ? data.reports : [];
        renderReportMenu(reports);
    } catch (err) {
        console.error(err);
    }
};

const loadDashboard = async () => {
    const query = activeReportId ? `?id=${encodeURIComponent(activeReportId)}` : "";
    try {
        const [stats, filtered, sbom] = await Promise.all([
            fetchJson(`${api.stats}${query}`),
            fetchJson(`${api.filtered}${query}`),
            fetchJson(api.sbom)
        ]);

        setStatus(stats.status || "PASS");
        reportMeta.textContent = `Report loaded: ${formatDate(stats.storedAt)}`;
        const reportLabel = stats.reportId || "Latest report";
        reportIdSummary.textContent = reportLabel;
        reportIdDetail.textContent = reportLabel;
        const updatedText = formatDate(stats.storedAt);
        lastUpdatedSummary.textContent = updatedText;
        lastUpdatedDetail.textContent = updatedText;
        const packageTotal = stats.summary?.totalPackages ?? sbom.totalPackages ?? "—";
        totalPackagesSummary.textContent = packageTotal;
        totalPackagesDetail.textContent = packageTotal;
        criticalCount.textContent = stats.summary?.critical ?? "0";
        highCount.textContent = stats.summary?.high ?? "0";
        mediumCount.textContent = stats.summary?.medium ?? "0";
        lowCount.textContent = stats.summary?.low ?? "0";

        renderFindings(filtered.filtered?.matches || []);
        renderPackages(sbom.packages || [], sbom.totalPackages);
    } catch (err) {
        console.error(err);
        statusBadge.className = "pill pill--fail";
        statusBadge.textContent = "Unavailable";
        reportMeta.textContent = "Unable to load dashboard data.";
        findingsTable.innerHTML = `<tr><td colspan="4"><div class="empty-state">Failed to load vulnerability details.</div></td></tr>`;
        packageList.innerHTML = `<div class="empty-state">Failed to load SBOM details.</div>`;
    }
};

reportSelector.addEventListener("change", (event) => {
    activeReportId = event.target.value;
    loadDashboard();
});

refreshBtn.addEventListener("click", () => {
    loadReports().then(loadDashboard);
});

loadReports().then(loadDashboard).catch((err) => console.error(err));
