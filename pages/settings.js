async function openSettings(panel, userPanel) {
    createElement("a", panel, {className:"heading", text:`settings`, href:"/cheat"});

    createElement("a", panel, { className: "button", text: "edit interests", href: "/cheat/settings/interests" });

    let waitForInterestsRow = createElement("div", panel, {className:"flex-row"});
    createElement("span", waitForInterestsRow, {text: "wait for interests"});
    createElement("a", waitForInterestsRow, {text: config.waitForInterests ? "on" : "off", onclick: e => {
        config.waitForInterests = !config.waitForInterests;
        saveConfig();
        e.target.innerHTML = config.waitForInterests ? "on" : "off";
    }});

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

    createElement("a", panel, { className: "button", text: "clear pfp cache", onclick: async e => {
        await deletePictureCache();
        e.target.innerHTML = "cleared pfps :)"
    }});

    createElement("a", panel, { className: "small-button", text: "search for updates (local)", href: "http://localhost:4731/emeraldcheat.user.js" });

    createElement("a", panel, { className: "button text-gold", text: "search for updates", href: "https://undateable.net/files/@asya/emeraldcheat.user.js" });
}

function saveConfig() {
    setStorageJSON("cheatConfig", config);
}

function openInterestEditor(panel, userPanel) {
    createElement("a", panel, {className:"heading", text:`edit interests`, href:"/cheat/settings"});

    let newContainer = createElement("form", panel, {className: "fill-width" });
    let nameInput = createElement("input", newContainer, {className: "fill-width"});
    nameInput.setAttribute("placeholder", "add...");
    nameInput.setAttribute("autofocus", "");
    newContainer.addEventListener("submit", async e => {
        e.preventDefault();
        let value = nameInput.value.trim();
        if (currentUser.interests.some(interest => interest.name == value)) {
            alert("interest already exists");
            return;
        }
        if (!/^[a-z ]+$/.test(value)) {
            alert("only lowercase letters and spaces");
            return;
        }
        nameInput.value = "";
        let interest = await sendActionRequest(`/add_interest?id=${encodeURIComponent(value)}`);
        currentUser.interests = [interest, ...currentUser.interests];
        let interestContainer = createElement("div", panel, {after: newContainer, className: "flex-row center-items accent-shadow" });
        createElement("span", interestContainer, { text: interest.name, className: "text-highlighted" });
        createElement("a", interestContainer, { text: "delete", className: "button", onclick: async e => {
            await sendActionRequest(`/remove_interest?id=${encodeURIComponent(interest.id)}`);
            currentUser.interests = currentUser.interests.filter(i => i.id !== interest.id);
            interestContainer.remove();
            nameInput.focus();
        }});
        nameInput.focus();
    });

    for (let interest of currentUser.interests) {
        let interestContainer = createElement("div", panel, {className: "flex-row center-items accent-shadow" });
        createElement("span", interestContainer, { text: interest.name, className: "text-highlighted" });
        createElement("a", interestContainer, { text: "delete", className: "button", onclick: async e => {
            await sendActionRequest(`/remove_interest?id=${encodeURIComponent(interest.id)}`);
            currentUser.interests = currentUser.interests.filter(i => i.id !== interest.id);
            interestContainer.remove();
            nameInput.focus();
        }});
    }

    return () => nameInput.focus();
}