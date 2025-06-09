async function openUserModOptions(panel) {
    let userId = parseInt(query("id"));
    if (!userId) return;
    let userJson = await loadJSON(`/profile_json?id=${userId}`);
    if (!userJson) return;
    let user = userJson.user;
    if (!user) return;

    await addUserHeader(panel, userJson);

    createElement("a", panel, {className:"button", text:"custom ban", href:`/cheat/mod/custom-ban?id=${user.id}`});
    createElement("a", panel, {className:"button", text:"shadow ban", onclick:async e => { e.target.innerHTML = "banning..."; await sendActionRequest(`/shadow_ban?id=${user.id}`, "GET"); window.history.back(); } });
    createElement("a", panel, {className:"button", text:"remove pfp", onclick:async e => { e.target.innerHTML = "removing..."; await sendActionRequest(`/remove_profile_pic?id=${user.id}`, "GET"); window.history.back(); } });
    createElement("a", panel, {className:"button", text:"unban", onclick:async e => { e.target.innerHTML = "pardoning..."; await sendActionRequest(`/unban?id=${user.id}`, "GET"); window.history.back(); } });
    createElement("a", panel, {className:"button", text:"copy identifier", onclick:e => {navigator.clipboard.writeText(`${user.platinum||user.gold?"[Paying user]\n":""}${user.display_name} #${user.username} // ${user.id}\n`); e.target.innerHTML = 'copied :)'}});
    createElement("a", panel, {text:user.id, href:`/cheat/people/user?id=${user.id}`, style:"color: var(--text-inactive)"});
}

async function openCustomBanPage(panel) {
    let userId = parseInt(query("id"));
    if (!userId) return;
    let userJson = await loadJSON(`/profile_json?id=${userId}`);
    if (!userJson) return;
    let user = userJson.user;
    if (!user) return;

    await addUserHeader(panel, userJson);

    let durationSelector = createElement("select", panel, {});
    durationSelector.innerHTML = `<option value="">select duration</option>${banDurations.map(x => `<option value="${x.value}">${x.name}</option>`).join("")}`;
    let reasonSelector = createElement("select", panel, {});
    reasonSelector.innerHTML = `<option value="">select reason</option>${banReasons.map(x => `<option value="${x.value}">${x.name}</option>`).join("")}`;
    let reasonInput = createElement("input", panel, {className:"fill-width"});
    reasonSelector.addEventListener("change", () => reasonInput.value = reasonSelector.value);
    createElement("a", panel, {className:"button", text:"execute", onclick:async e => { let reason = reasonInput.value.trim(); if (durationSelector.value !== "" && reason !== "") { e.target.innerHTML = "banning..."; await banUser(userId, durationSelector.value, reason); window.history.back(); } } });
}