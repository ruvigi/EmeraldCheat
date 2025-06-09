async function openNotifications(panel) {
    if (notiButton.classList.contains("text-gold")) {
        notiButton.classList.remove("text-gold");
    }
    if (!msgsButton.classList.contains("text-gold")) {
        document.title = "EmeraldCheat";
    }
    createElement("a", panel, {className:"heading", text:`notifications`, href:"/cheat"});
    let notificationsJson = await loadJSON("/notifications_json");
    await sendActionRequest("/clear_notifications", "GET");

    let container = createElement("div", panel, {className:"flex-column"});

    if (notificationsJson.unread.length === 0 && notificationsJson.read.length === 0 && notificationsJson.friend_requests.length === 0) {
        createElement("span", panel, {text:"no messages :c"});
        return;
    }

    for (let item of notificationsJson.friend_requests) {
        let row = createElement("div", container, {className:"flex-row fill-width"});
        createElement("img", row, {className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(item.data.sender), srcFull:userPicture(item.data.sender)});
        let column = createElement("div", row, {className:"flex-grow-1 flex-column fill-width flex-block-overflow gap-0"});
        let heading = createElement("div", column, {className:"flex-row center-items"});
        createElement("a", heading, {text:item.data.sender.display_name, className:"text-highlighted", href:`/cheat/people/user?id=${item.data.sender.id}`});
        createElement("span", heading, {text:timeSince(item.created_at), style:"font-size: 0.75rem", className: "text-gold"});
        createElement("span", column, { text: "wants to be besties" });
        let actionRow = createElement("div", column, { className: "flex-row" });
        createElement("a", actionRow, { text: "accept", onclick: async e => { await sendActionRequest(`/friends_accept?friend_id=${item.sender_id}&notification_id=${item.id}`); e.target.parentElement.parentElement.parentElement.remove(); } });
        createElement("a", actionRow, { text: "reject", onclick: async e => { await sendActionRequest(`/friends_decline?friend_id=${item.sender_id}&notification_id=${item.id}`); e.target.parentElement.parentElement.parentElement.remove(); } });
    }

    let tuples = [];

    function collectItems(items, unread) {
        for (let item of items) {
            tuples.push({ item: item, date: new Date(item.created_at), unread: unread });
        }
    }

    collectItems(notificationsJson.unread, true);
    collectItems(notificationsJson.read, false);

    tuples.sort((a,b) => b.date - a.date);

    for (let tuple of tuples) {
        let item = tuple.item;
        let row = createElement("a", container, { className:"flex-row fill-width text-inactive", href:`/cheat/people/user?id=${item.data.sender.id}` });
        createElement("img", row, { className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(item.data.sender) });
        let column = createElement("div", row, { className:"flex-grow-1 flex-column fill-width flex-block-overflow gap-0" });
        let heading = createElement("div", column, { className:"flex-row center-items" });
        createElement("span", heading, { text:item.data.sender.display_name, className:"text-highlighted" });
        createElement("span", heading, { text:timeSince(item.created_at), style:"font-size: 0.75rem", className: tuple.unread ? "text-gold" : null });
        createElement("span", column, { text: item.data.content });
    }
}