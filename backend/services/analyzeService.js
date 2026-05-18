function analyzeData(sbom, vulnerabilities) {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    vulnerabilities.matches.forEach(v => {
        const severity = v.vulnerability.severity;

        if (severity === "Critical") critical++;
        else if (severity === "High") high++;
        else if (severity === "Medium") medium++;
        else if (severity === "Low") low++;
    });

    let status = "PASS";
    if (critical > 0 || high > 0) {
        status = "FAIL";
    }

    return {
        status,
        summary: { critical, high, medium, low }
    };
}

module.exports = { analyzeData };