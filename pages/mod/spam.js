let spamItems;
let spamTimestamp;
let spamLastTuple;
let spamIgnored = (getStorageJSON("spamIgnored") ?? []).filter(item => new Date() - new Date(item.latest_message) < 86400000);

async function openSpam(panel, userPanel) {
    await loadSpam(config.modAsLists);
    if (spamItems.length === 0) {
        createElement("a", panel, {className:"heading", text: "spam", href:"/cheat/mod"});
        createElement("span", panel, {text:"no spam"});
        let spamReloadElement = createElement("a", panel, {className: "button", text:"reload", onclick:e => {e.target.innerHTML = "loading"; internalReloadMain(); }});
        onKeyDown = e => { if(!e.ctrlKey && e.key === "r") { spamReloadElement.innerHTML = "loading"; internalReloadMain(); }};
    } else if (config.modAsLists) {
        createElement("a", panel, {className:"heading", text:"spam", href:"/cheat/mod"});
        let container = createElement("div", panel, {className:"flex-column", style:"gap: 1rem;"});
        for (tuple of spamItems) {
            let row = createElement("div", container, {className:"flex-row", style: "gap: 1rem;"});

            let leftColumn = createElement("div", row, {style:"width: 9rem; min-height: 9rem;", className:"flex-column center-both flex-grow-0"});
            createElement("span", leftColumn, {text:timeSince(tuple.latest_message), style:Math.floor(new Date() - new Date(tuple.latest_message)) > 1800000 ? "color: var(--red);":""});
            createElement("i", leftColumn, {text:tuple.content, style:"color: var(--text);", className: "max-width-full"});
            createElement("span", leftColumn, {text:`${tuple.message_count}x`, style:tuple.message_count > 10 ? "color: var(--accent);" : null});

            let rightColumn = createElement("div", row, {className: "flex-column align-items-start", style: "justify-content: center;"});
            createElement("a", rightColumn, {text:tuple.display_name, href: `/cheat/people/user?id=${tuple.id}`, style: "color: var(--accent);"});
            createElement("a", rightColumn, {className: "button", text:"mark as read", onclick:async e => await markSpamAsRead(tuple, e.target, true) });
            createElement("a", rightColumn, {className: "button", text:"ban for spam", onclick:async e => await banForSpam(tuple, e.target, true) });
        }
        createElement("a", panel, {className: "button", text:"mark all as read", onclick:e => markAllSpamAsRead(e.target)});
    } else {
        setLoading(panel);
        setLoading(userPanel);
        spamLastTuple = spamItems[0];
        return () => internalReplaceState(`/cheat/mod/spammer?id=${spamLastTuple.id}`);
    }
}

async function openSpamDetection(panel, userPanel) {
    let userId = parseInt(query("id"));
    await loadSpam();
    let spamTuple = spamItems.find(item => item.id === userId);
    if (!spamTuple) {
        if (spamLastTuple && spamLastTuple.id === userId) {
            spamTuple = spamLastTuple;
        } else {
            await loadReports(true);
            spamTuple = reportItems.find(item => item.id === userId);
            spamLastTuple = spamTuple;
            if (!spamTuple) {
                createElement("a", panel, {className:"heading", text: "spam", href:"/cheat/mod"});
                createElement("span", panel, {text:"spam not found :("});
                createElement("a", panel, {className: "button", text:"back", href:"/cheat/mod/spam"});
                onKeyDown = e => { if(!e.ctrlKey && e.key === "q") { internalReplaceState("/cheat/mod/spam"); }};
                focusPanel(0);
                return;
            }
        }
    }
    spamLastTuple = spamTuple;
    let userPromise = openUser(userPanel, userId);

    createElement("a", panel, {className:"heading", text:`spam +${spamItems.length - 1}`, href:"/cheat/mod"});
    createElement("span", panel, {text:timeSince(spamTuple.latest_message), style:Math.floor(new Date() - new Date(spamTuple.latest_message)) > 1800000 ? "color: var(--red);":""});
    createElement("i", panel, {text:spamTuple.content, style:"color: var(--text);"});
    createElement("span", panel, {text:`${spamTuple.message_count}x`, style:spamTuple.message_count > 10 ? "color: var(--accent);" : null});

    await userPromise;

    let buttonContainer = createElement("div", panel, {className:"flex-row", style:"gap: 1rem"});
    let readButton = createElement("a", buttonContainer, {className: "button", text:"mark as read", onclick:async e => await markSpamAsRead(spamTuple, e.target) });
    createElement("a", buttonContainer, {className: "button", text:"ban for spam", onclick:async e => await banForSpam(spamTuple, e.target) });
    onKeyDown = async e => {
        if (e.ctrlKey) return;
        switch (e.key) {
            case "m":
            case "r":
                e.preventDefault();
                await markSpamAsRead(spamTuple, readButton);
                break;
        }
    };
}

async function markSpamAsRead(spamTuple, buttonElement, stay) {
    buttonElement.innerHTML = "reading...";
    let existingEntry = spamIgnored.find(item => item.id === spamTuple.id && item.content === spamTuple.content);
    if (existingEntry) {
        existingEntry.latest_message = spamTuple.latest_message;
    } else {
        spamIgnored.push({id: spamTuple.id, latest_message: spamTuple.latest_message, content: spamTuple.content});
    }
    setStorageJSON("spamIgnored", spamIgnored);
    if (stay) {
        spamItems = spamItems.filter(t => t.id != spamTuple.id || t.content != t.content);
        buttonElement.parentElement.parentElement.remove();
        if (spamItems.length === 0) {
            internalReloadMain();
        }
    } else {
        spamItems.shift(); //remove first item so the spam detections keep working without a reload
        internalReplaceState("/cheat/mod/spam");
    }
}

async function banForSpam(spamTuple, buttonElement, stay) {
    buttonElement.innerHTML = "banning...";
    await banUser(spamTuple.id, ban30min.value, banSpam.value);
    let existingEntry = spamIgnored.find(item => item.id === spamTuple.id && item.content === spamTuple.content);
    if (existingEntry) {
        existingEntry.latest_message = spamTuple.latest_message;
    } else {
        spamIgnored.push({id: spamTuple.id, latest_message: spamTuple.latest_message, content: spamTuple.content});
    }
    setStorageJSON("spamIgnored", spamIgnored);
    if (stay) {
        spamItems = spamItems.filter(t => t.id != spamTuple.id || t.content != t.content);
        buttonElement.parentElement.parentElement.remove();
        if (spamItems.length === 0) {
            internalReloadMain();
        }
    } else {
        spamItems.shift(); //remove first item so the spam detections keep working without a reload
        internalReplaceState("/cheat/mod/spam");
    }
}

function markAllSpamAsRead(buttonElement) {
    buttonElement.innerHTML = "reading all...";
    for (let tuple of spamItems) {
        let existingEntry = spamIgnored.find(item => item.id === tuple.id && item.content === tuple.content);
        if (existingEntry) {
            existingEntry.latest_message = tuple.latest_message;
        } else {
            spamIgnored.push({id: tuple.id, latest_message: tuple.latest_message, content: tuple.content});
        }
    }
    setStorageJSON("spamIgnored", spamIgnored);
    spamItems = null;
    internalReloadMain();
}



async function loadSpam(forceReload) {
    if (!forceReload && spamItems && spamTimestamp && (new Date() - spamTimestamp) < 15000)
        return;

    let newSpam = await loadJSON(`/spam_moderation`, true);
    if (newSpam) {
        spamItems = newSpam.filter(item => !spamIgnored.some(ignored => item.id == ignored.id && item.content == ignored.content));
        spamTimestamp = new Date();
    }
}