async function openMessages(panel) {
    if (msgsButton.classList.contains("text-gold")) {
        msgsButton.classList.remove("text-gold");
    }
    if (!notiButton.classList.contains("text-gold")) {
        document.title = "EmeraldCheat";
    }
    createElement("a", panel, {className:"heading", text:`direct messages`, href:"/cheat"});
    let messagesJson = await loadJSON("/message_notifications_json");
    await sendActionRequest("/clear_messages", "GET");

    let container = createElement("div", panel, {className:"flex-column"});

    if (messagesJson.unread.length === 0 && messagesJson.read.length === 0) {
        createElement("span", panel, {text:"no messages :c"});
        return;
    }

    let tuples = [];

    function collectItems(items, unread) {
        for (let item of items) {
            tuples.push({ item: item, date: new Date(item.created_at), unread: unread });
        }
    }

    collectItems(messagesJson.unread, true);
    collectItems(messagesJson.read, false);

    tuples.sort((a,b) => b.date - a.date);

    for (let tuple of tuples) {
        let item = tuple.item;
        let row = createElement("a", container, { className:"flex-row fill-width text-inactive", href:`/cheat/chat/direct?id=${item.data.sender.id}` });
        createElement("img", row, { className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(item.data.sender) });
        let column = createElement("div", row, { className:"flex-grow-1 flex-column fill-width flex-block-overflow gap-0" });
        let heading = createElement("div", column, { className:"flex-row center-items" });
        createElement("span", heading, { text:item.data.sender.display_name, className:"text-highlighted" });
        createElement("span", heading, { text:timeSince(item.created_at), style:"font-size: 0.75rem", className: tuple.unread ? "text-gold" : null });
        function addContent(text) {
            let content = createElement("span", column, {});
            createElement("span", content, { text:`${item.data.message.user === currentUser.id ? "you" : translateGenderToPrefix(item.data.sender.gender)}: `, className: "text-normal" });
            createElement("span", content, { text: text });
        }
        if (item.data.message.picture) {
            addContent("[picture]");
        }
        for (let line of item.data.message.messages) {
            addContent(line);
        }
    }
}