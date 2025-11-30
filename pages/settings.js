let quickBans = getStorageJSON("cheatQuickBans") ?? [
    { id: 0, name: banSpam.name, reason: banSpam.value, duration: ban30min.value },
    { id: 1, name: banEnglish.name, reason: banEnglish.value, duration: ban30min.value },
    { id: 2, name: banSexual.name, reason: banSexual.value, duration: ban30min.value },
    { id: 3, name: banRacist.name, reason: banRacist.value, duration: ban3h.value },
    { id: 4, name: banUnderage.name, reason: banUnderage.value, duration: ban15min.value }
];

async function openSettings(panel, userPanel) {
    createElement("a", panel, {className:"heading", text:`settings`, href:"/cheat"});

    if (currentUser.mod) {
        let modAsListsRow = createElement("div", panel, {className:"flex-row"});
        createElement("span", modAsListsRow, {text: "mod as lists"});
        createElement("a", modAsListsRow, {text: config.modAsLists ? "on" : "off", onclick: e => {
            config.modAsLists = !config.modAsLists;
            saveConfig();
            e.target.innerHTML = config.modAsLists ? "on" : "off";
        }});

        let doNotPreloadVideosRow = createElement("div", panel, {className:"flex-row"});
        createElement("span", doNotPreloadVideosRow, {text: "preload videos"});
        createElement("a", doNotPreloadVideosRow, {text: !config.doNotPreloadVideos ? "on" : "off", onclick: e => {
            config.doNotPreloadVideos = !config.doNotPreloadVideos;
            saveConfig();
            e.target.innerHTML = !config.doNotPreloadVideos ? "on" : "off";
        }});
    }

    let hideFromGroupsRow = createElement("div", panel, {className:"flex-row"});
    createElement("span", hideFromGroupsRow, {text: "hide from groups"});
    createElement("a", hideFromGroupsRow, {text: config.hideFromGroups ? "on" : "off", onclick: e => {
        config.hideFromGroups = !config.hideFromGroups;
        saveConfig();
        e.target.innerHTML = config.hideFromGroups ? "on" : "off";
    }});

    let doNotPreloadProfilePicturesRow = createElement("div", panel, {className:"flex-row"});
    createElement("span", doNotPreloadProfilePicturesRow, {text: "preload pfps"});
    createElement("a", doNotPreloadProfilePicturesRow, {text: !config.doNotPreloadProfilePictures ? "on" : "off", onclick: e => {
        config.doNotPreloadProfilePictures = !config.doNotPreloadProfilePictures;
        saveConfig();
        e.target.innerHTML = !config.doNotPreloadProfilePictures ? "on" : "off";
    }});


    if (currentUser.mod) {
        createElement("a", panel, { className: "button", text: "quick bans", href: "/cheat/settings/quick-bans" });
    }

    createElement("a", panel, { className: "button", text: "clear pfp cache", onclick: async e => {
        await deletePictureCache();
        e.target.innerHTML = "cleared pfps :)"
    }});

    createElement("a", panel, { className: "small-button", text: "search for updates (beta)", href: "https://undateable.net/files/@asya/emeraldcheat-beta.user.js" });

    createElement("a", panel, { className: "small-button", text: "search for updates (local)", href: "http://localhost:4731/emeraldcheat.user.js" });

    createElement("a", panel, { className: "button text-gold", text: "search for updates", href: "https://undateable.net/files/@asya/emeraldcheat.user.js" });
}

function saveConfig() {
    setStorageJSON("cheatConfig", config);
}

function openQuickBanSettings(panel, userPanel) {
    createElement("a", panel, {className:"heading", text:`quick bans`, href:"/cheat/settings"});

    for (let quickBan of quickBans) {
        let banContainer = createElement("div", panel, {className: "flex-column center-items accent-shadow" });
        createElement("span", banContainer, { text: quickBan.name, className: "text-highlighted" });
        createElement("span", banContainer, { text: quickBan.reason });
        createElement("span", banContainer, { text: timeString(quickBan.duration) });
        createElement("a", banContainer, { text: "delete", className: "button", onclick: e => {
            quickBans = quickBans.filter(b => b.id !== quickBan.id);
            saveQuickBans();
            e.target.parentElement.remove();
        }});
    }

    
    let newContainer = createElement("div", panel, {className: "flex-column center-items fill-width accent-shadow" });
    createElement("span", newContainer, { text: "new", className: "text-highlighted" });
    let nameInput = createElement("input", newContainer, {className: "fill-width"});
    nameInput.setAttribute("placeholder", "name...");
    let durationSelector = createElement("select", newContainer, {});
    durationSelector.innerHTML = `<option value="">select duration</option>${banDurations.map(x => `<option value="${x.value}">${x.name}</option>`).join("")}`;
    let reasonSelector = createElement("select", newContainer, {});
    reasonSelector.innerHTML = `<option value="">select reason</option>${banReasons.map(x => `<option value="${x.value}">${x.name}</option>`).join("")}`;
    let reasonInput = createElement("input", newContainer, {className:"fill-width"});
    reasonInput.setAttribute("placeholder", "reason...");
    reasonSelector.addEventListener("change", () => reasonInput.value = reasonSelector.value);
    createElement("a", newContainer, {className:"button", text:"add", onclick: e => { let reason = reasonInput.value.trim(); let name = nameInput.value.trim(); if (name !== "" && durationSelector.value !== "" && reason !== "") {
        quickBans.push({id: new Date().valueOf(), name: name, reason: reason, duration: parseInt(durationSelector.value)});
        saveQuickBans();
        internalReloadMain();
    } } });
}

function saveQuickBans() {
    setStorageJSON("cheatQuickBans", quickBans);
}