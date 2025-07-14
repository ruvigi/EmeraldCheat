let reportItems;
let reportTimestamp;
let reportLastTuple;

async function openReports(panel, userPanel) {
    await loadReports(!reportItems || reportItems.length === 0);
    if (reportItems.length === 0) {
        createElement("a", panel, {className:"heading", text: "reports", href:"/cheat/mod"});
        createElement("span", panel, {text:"no reports"});
        let reportsReloadElement = createElement("a", panel, {className: "button", text:"reload", onclick:e => {e.target.innerHTML = "loading"; internalReloadMain();}});
        onKeyDown = e => { if(!e.ctrlKey && e.key === "r") { reportsReloadElement.innerHTML = "loading"; internalReloadMain(); }};
    } else {
        setLoading(panel);
        setLoading(userPanel);
        reportLastTuple = reportItems[0];
        return () => internalReplaceState(`/cheat/mod/report?id=${reportLastTuple.id}`);
    }
}

async function openReport(panel, userPanel) {
    let userId = parseInt(query("id"));
    await loadReports();
    let reportTuple = reportItems.find(item => item.id === userId);
    if (!reportTuple) {
        if (reportLastTuple && reportLastTuple.id === userId) {
            reportTuple = reportLastTuple;
        } else {
            await loadReports(true);
            reportTuple = reportItems.find(item => item.id === userId);
            reportLastTuple = reportTuple;
            if (!reportTuple) {
                createElement("a", panel, {className:"heading", text: "reports", href:"/cheat/mod"});
                createElement("span", panel, {text:"report not found :("});
                createElement("a", panel, {className: "button", text:"back", href:"/cheat/mod/reports"});
                onKeyDown = e => { if(!e.ctrlKey && e.key === "q") { internalReplaceState("/cheat/mod/reports"); }};
                focusPanel(0);
                return;
            }
        }
    }
    reportLastTuple = reportTuple;
    let userPromise = openUser(userPanel, userId);

    createElement("a", panel, {className:"heading", text:`report +${reportItems.length - 1}`, href:"/cheat/mod"});
    let reportContainer = createElement("div", panel, {className:"flex-column"});
    let reports = reportTuple.report_logs.sort((a,b) => {
        let result = reportHasContent(b) - reportHasContent(a);
        if (result === 0) result = new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf();
        return result;
    });
    let nextIndex = 0;
    async function loadNextReports() {
        let limit = Math.min(nextIndex + 10, reports.length);
        while (nextIndex < limit) {
            let report = reports[nextIndex];
            nextIndex++;
            let reporter = null;//disabled to avoid 429 // await loadJSON(`/profile_json?id=${report.reported_by_id}`, true);
            let reportRow = createElement("div", reportContainer, {className:"flex-row fill-width"});
            if (reporter) {
                createElement("img", reportRow, {className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(reporter.user)});
            } else {
                createElement("div", reportRow, {className:"image placeholder flex-grow-0", style:"width: 3rem; height: 3rem;", text:"?"});
            }
            let reportColumn = createElement("div", reportRow, {className:"flex-grow-1 flex-column flex-block-overflow"});
            let reportMainColumn = createElement("div", reportColumn, {className:"flex-column fill-width gap-0"});
            let reportHeading = createElement("div", reportMainColumn, {className:"flex-row center-items"});
            createElement("a", reportHeading, {text:reporter?reporter.user.display_name:`reporter #${report.username}`, className:"text-highlighted", href:`/cheat/people/user?id=${report.reported_by_id}`});
            createElement("span", reportHeading, {text:timeSince(report.created_at), style:`font-size: 0.75rem;${Math.floor(new Date() - new Date(report.created_at)) > 1800000 ? " color: var(--red);":""}`});
            createElement("span", reportMainColumn, {text:report.reason&&report.reason!==""?report.reason:"no reason provided :("});
            if (report.message && report.message !== "")
                createElement("i", reportMainColumn, {text:report.message, style:"color:var(--text)"});
            if (report.image) {
                createElement("img", reportMainColumn, {className:"image flex-grow-0", style:"width: 10rem; height: 10rem; margin-top: 0.25rem;", src:report.image});
            }
        }
        if (nextIndex < reports.length) {
            createElement("a", reportContainer, { text:`older reports (${limit}/${reports.length})`, onclick:e => { e.target.remove(); loadNextReports(); } });
        }
    }
    await loadNextReports();
    await userPromise;

    let readButton = createElement("a", panel, {className: "button", text:"mark as read", onclick:async e => await markReportAsRead(reportTuple, e.target) });
    onKeyDown = async e => {
        if (e.ctrlKey) return;
        switch (e.key) {
            case "m":
            case "r":
                e.preventDefault();
                await markReportAsRead(reportTuple, readButton);
                break;
        }
    };
}

function reportHasContent(report) {
    return (report.message && report.message !== null) || report.image;
}

async function loadReports(forceReload) {
    if (!forceReload && reportItems && reportTimestamp && (new Date() - reportTimestamp) < 15000)
        return;

    let promise1 = loadJSON(`/report_logs_moderation?sort=most_recent&page=1&read=false`, true);
    let promise2 = loadJSON(`/report_logs_moderation?sort=max_count&page=1&read=false`, true);
    let items1 = await promise1;
    let items2 = await promise2;
    if (items1 && items2) {
        let items = [...new Set([...items1, ...items2])];
        shuffleArray(items);
        reportItems = items;
        reportTimestamp = new Date();
    }
}

async function markReportAsRead(reportTuple, buttonElement) {
    reportItems.shift(); //remove first item so the reports keep working without a reload
    buttonElement.innerHTML = "reading...";
    await sendActionRequest(`/hide?ids=${reportTuple.id}`, "GET", true);
    internalReplaceState("/cheat/mod/reports");
}