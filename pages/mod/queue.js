let queueItems;
let queueTimestamp;
let queueLastRequestTuple;

async function openQueue(panel, userPanel) {
    await loadQueue(true);
    if (queueItems.length === 0) {
        createElement("a", panel, {className:"heading", text: "queue", href:"/cheat/mod"});
        createElement("span", panel, {text:"no requests"});
        let queueReloadElement = createElement("a", panel, {className: "button", text:"reload", onclick:e => {e.target.innerHTML = "loading"; internalReloadMain();}});
        onKeyDown = e => { if(!e.ctrlKey && e.key === "r") { queueReloadElement.innerHTML = "loading"; internalReloadMain(); }};
    } else {
        setLoading(panel);
        setLoading(userPanel);
        queueLastRequestTuple = queueItems[0];
        return () => internalReplaceState(`/cheat/mod/queue/${queueLastRequestTuple.type}?id=${queueLastRequestTuple.request.id}`);
    }
}

async function openNameRequests(panel, userPanel) {
    await openRequestList(panel, "display_name", "names");
}

async function openPictureRequests(panel, userPanel) {
    await openRequestList(panel, "picture", "pictures");
}

async function openRequestList(panel, type, title) {
    await loadQueue(true);
    let items = queueItems.filter(t => t.type === type);
    if (items.length === 0) {
        createElement("a", panel, {className:"heading", text: title, href:"/cheat/mod"});
        createElement("span", panel, {text:"no requests"});
        let queueReloadElement = createElement("a", panel, {className: "button", text:"reload", onclick:e => {e.target.innerHTML = "loading"; internalReloadMain();}});
        onKeyDown = e => { if(!e.ctrlKey && e.key === "r") { queueReloadElement.innerHTML = "loading"; internalReloadMain(); }};
    } else {
        let promises = [];
        createElement("a", panel, {className:"heading", text:`${title} (${items.length})`, href:"/cheat/mod"});
        let queueContainer = createElement("div", panel, {className:"flex-column", style:"gap: 1rem;"});
        for (let requestTuple of items) {
            let requestRow = createElement("div", queueContainer, {className:"flex-row", style: "gap: 1rem;"});
            let currentDisplayName = "[???]";
            switch (requestTuple.type) {
                case "display_name":
                    currentDisplayName = requestTuple.request.old_display_name;
                    let nameContainer = createElement("div", requestRow, {style:"width: 9rem; height: 9rem;", className:"flex-column center-both flex-grow-0"});
                    createElement("span", nameContainer, {text: requestTuple.request.new_display_name});
                    break;
                case "picture":
                    currentDisplayName = requestTuple.request.display_name;
                    let imgElement = createElement("img", requestRow, {className: "image flex-grow-0 invisible", style:"width: 9rem; height: 9rem;"});
                    imgElement.addEventListener("load", () => imgElement.classList.remove("invisible"));
                    promises.push(loadImage(imgElement, requestTuple.request.image_url));
                    break;
            }
            let requestColumn = createElement("div", requestRow, {className: "flex-column align-items-start", style: "justify-content: center;"});
            createElement("a", requestColumn, {text:currentDisplayName, href: `/cheat/people/user?id=${requestTuple.request.user_id}`, style: "color: var(--accent);"});
            createElement("a", requestColumn, {className: "button", text:"accept", onclick:async e => await acceptRequest(requestTuple, e.target, true) });
            createElement("a", requestColumn, {className: "button", text:"reject", onclick:async e => await rejectRequest(requestTuple, e.target, true) });
        }
        createElement("a", panel, {className: "button", text:"accept all", onclick:async e => await acceptAllRequests(e.target, type)});
        for (let promise of promises) {
            await promise;
        }
    }
}

async function openNameRequest(panel, userPanel) {
    let requestId = parseInt(query("id"));
    let requestTuple = await loadRequest(panel, "display_name", requestId);
    if (!requestTuple) return;

    createElement("a", panel, {className:"heading", text:`name request +${queueItems.length - 1}`, href:"/cheat/mod"});
    let nameContainer = createElement("span", panel, {style:"width: 100%; height: calc(100% - 10rem); font-size: 1.5rem", className:"block-grow flex-row center-both"});
    createElement("span", nameContainer, {style:"text-align: center", text:requestTuple.request.new_display_name});

    await lowerRequestPage(panel, userPanel, requestTuple);
}

async function openPictureRequest(panel, userPanel) {
    let requestId = parseInt(query("id"));
    let requestTuple = await loadRequest(panel, "picture", requestId);
    if (!requestTuple) return;

    createElement("a", panel, {className:"heading", text:`picture request +${queueItems.length - 1}`, href:"/cheat/mod"});
    let imgElement = createElement("img", panel, {style:"width: 100%; height: calc(100% - 10rem)", className:"image image-contain block-grow invisible"});
    imgElement.addEventListener("load", () => imgElement.classList.remove("invisible"));
    let imgPromise = loadImage(imgElement, requestTuple.request.image_url);

    await lowerRequestPage(panel, userPanel, requestTuple, imgElement);
    await imgPromise;
}

async function lowerRequestPage(panel, userPanel, requestTuple, pictureElement) {
    let buttonContainer = createElement("div", panel, {className:"flex-row", style:"gap: 1rem"});
    let acceptButton = createElement("a", buttonContainer, {className: "button", text:"accept", onclick:async e => await acceptRequest(requestTuple, e.target) });
    let rejectButton = createElement("a", buttonContainer, {className: "button", text:"reject", onclick:async e => await rejectRequest(requestTuple, e.target) });
    await openUser(userPanel, requestTuple.request.user_id);
    onKeyDown = async e => {
        if (e.ctrlKey) return;
        switch (e.key) {
            case "a":
                e.preventDefault();
                await acceptRequest(requestTuple, acceptButton);
                break;
            case "d":
            case "r":
                e.preventDefault();
                await rejectRequest(requestTuple, rejectButton);
                break;
            case "f":
                if (pictureElement) {
                    pictureElement.click();
                }
                break;
        }
    };
}

async function loadQueue(forceReload) {
    if (!forceReload && queueItems && queueTimestamp && (new Date() - queueTimestamp) < 5000)
        return;

    let items = [];
    let pictureRequestsPromise = loadJSON("/picture_moderations");
    let nameRequestsPromise = loadJSON("/display_name_moderations");
    let pictureRequests = await pictureRequestsPromise;
    let nameRequests = await nameRequestsPromise;
    if (!pictureRequests || !nameRequests) return;
    for (let pictureRequest of pictureRequests)
        items.push({type: "picture", request: pictureRequest });
    for (let nameRequest of nameRequests)
        items.push({type: "display_name", request: nameRequest });
    shuffleArray(items);

    queueTimestamp = new Date();
    queueItems = items;
}

async function loadRequest(panel, requestType, requestId) {
    await loadQueue();
    let requestTuple = queueItems.find(item => item.type === requestType && item.request.id === requestId);
    if (!requestTuple) {
        if (queueLastRequestTuple && queueLastRequestTuple.type == requestType && queueLastRequestTuple.request.id === requestId) {
            requestTuple = queueLastRequestTuple;
        } else {
            await loadQueue(true);
            requestTuple = queueItems.find(item => item.type === requestType && item.request.id === requestId);
            queueLastRequestTuple = requestTuple;
            if (!requestTuple) {
                panel.innerHTML = "";
                createElement("a", panel, {className:"heading", text: "queue", href:"/cheat/mod"});
                createElement("span", panel, {text:"request not found :("});
                createElement("a", panel, {className: "button", text:"back", href:"/cheat/mod/queue"});
                onKeyDown = e => { if(!e.ctrlKey && e.key === "q") { internalReplaceState("/cheat/mod/queue"); }};
                focusPanel(0);
                return;
            }
        }
    }
    queueLastRequestTuple = requestTuple;
    return requestTuple;
}

async function acceptRequest(requestTuple, buttonElement, fromList) {
    buttonElement.innerHTML = "accepting";
    if ((await sendActionRequest(`/${requestTuple.type}_moderations/${requestTuple.request.id}/approve`, "POST", true)) === false) {
        await rejectRequest(requestTuple, buttonElement, fromList);
        return;
    }
    if (fromList) {
        queueItems = queueItems.filter(r => r.type != requestTuple.type || r.request.id != requestTuple.request.id);
        buttonElement.parentElement.parentElement.remove();
        if (!queueItems.some(r => r.type === requestTuple.type)) {
            internalReloadMain();
        }
    } else {
        internalReplaceState("/cheat/mod/queue");
    }
}

async function rejectRequest(requestTuple, buttonElement, fromList) {
    buttonElement.innerHTML = "rejecting";
    await sendActionRequest(`/${requestTuple.type}_moderations/${requestTuple.request.id}`, "DELETE", true);
    if (fromList) {
        queueItems = queueItems.filter(r => r.type != requestTuple.type || r.request.id != requestTuple.request.id);
        buttonElement.parentElement.parentElement.remove();
        if (!queueItems.some(r => r.type === requestTuple.type)) {
            internalReloadMain();
        }
    } else {
        internalReplaceState("/cheat/mod/queue");
    }
}

async function acceptAllRequests(buttonElement, type) {
    buttonElement.innerHTML = "accepting all...";
    let promises = [];
    for (let requestTuple of queueItems.filter(r => r.type === type)) {
        promises.push(sendActionRequest(`/${requestTuple.type}_moderations/${requestTuple.request.id}/approve`, "POST", true).then(async response => {
            if (response === false) {
                await sendActionRequest(`/${requestTuple.type}_moderations/${requestTuple.request.id}`, "DELETE", true);
            }
        }));
    }
    for (let promise of promises) {
        await promise;
    }
    queueItems = queueItems.filter(r => r.type !== type);
    internalReloadMain();
}