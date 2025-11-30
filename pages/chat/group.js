async function openGroups(panel) {
    createElement("a", panel, { className: "heading", text: "group chats", href:"/cheat" });
    let groupsJson = await loadJSON("/channels_default");
    if (!groupsJson) return;

    let groups = groupsJson.text_channels;
    groups.sort((a,b) => b.members.length - a.members.length);

    for (let group of groups) {
        if (group.channel.channel_type !== "text" || group.channel.private !== false) {
            continue;
        }
        let row = createElement("a", panel, { className: "flex-row", href: `/cheat/chat/group?id=${group.channel.id}` });
        createElement("span", row, { text: group.channel.name });
        createElement("span", row, { className: "text-inactive", text: `${group.members.length}/${group.channel.capacity}` });
    }
}

async function openGroup(panel, userPanel) {
    let groupId = parseInt(query("id"));
    if (!groupId) return;
    let group = await loadJSON(`/channel_json?id=${groupId}`);
    if (!group) return;

    createElement("a", panel, { className: "heading", text: group.channel.name, href: "/cheat/chat/groups" });

    let messageContainer = createElement("div", panel, { className: "flex-grow-1 fill-width flex-column", style: "overflow: hidden auto;" });
    createElement("div", messageContainer, { style: "flex: 1 1 auto;" });

    let lastUserId = null;
    let lastColumn = null;

    async function addMessage(message) {
        if (!lastUserId || message.user.id !== lastUserId) {
            if (messageContainer.childElementCount >= 100) {
                let newScrollTop = messageContainer.scrollTop - messageContainer.firstElementChild.clientHeight - parseFloat(getComputedStyle(messageContainer).gap);
                messageContainer.firstElementChild.remove();
                if (newScrollTop >= 0) {
                    messageContainer.scrollTop = newScrollTop;
                }
            }

            let messageRow = createElement("div", messageContainer, { className: "flex-row" });

            createElement("img", messageRow, { className: "image flex-grow-0", style: "width: 3rem; height: 3rem;", src: userThumbnail(message.user), srcFull: userPicture(message.user) });

            lastColumn = createElement("div", messageRow, { className: "flex-column gap-0" });
            createElement("a", lastColumn, {text: message.user.display_name, className:"text-highlighted", href:`/cheat/people/user?id=${message.user.id}`});
            lastUserId = message.user.id;
        }

        if (message.picture) {
            createElement("img", lastColumn, { className: "image", style: "width: 9rem; height: 9rem;", src: message.picture });
        }

        for (let line of message.messages) {
            let imageUrl = decodeURIComponent(line).split(" ").find(word => word.startsWith("i.imgur.com/") && !word.includes("@"));
            if (imageUrl) {
                createElement("img", lastColumn, { className: "image", style: "width: 9rem; height: 9rem;", src: `https://${imageUrl}` });
            } else {
                createElement("span", lastColumn, { text: line });
            }
        }
    }

    for (let message of group.messages) {
        await addMessage(message);
    }

    let sendToMessageSock;

    let form = createElement("form", panel, { className:"fill-width" });
    let input = createElement("input", form, { className:"fill-width" });
    form.addEventListener("submit", e => {
        e.preventDefault();
        sendToMessageSock({
            command: "message",
            identifier: JSON.stringify({
                channel: "RoomChannel",
                room_id: `channel${groupId}`,  
            }),
            data: JSON.stringify({
                message: input.value,
                id: `channel${groupId}`,
                mode: "channel",
                action: "speak"
            })
        });
        input.value = "";
    });
    input.setAttribute("autofocus", "");


    let users = new Map();
    createElement("a", userPanel, { className: "heading", text: "users", href:"/cheat/chat/groups" });

    let userContainer = createElement("div", userPanel, { className: "flex-column" });

    function addUser(user) {
        let userRow = createElement("div", userContainer, { className: "flex-row center-items" });
        createElement("img", userRow, { className: "image", style: "width: 3rem; height: 3rem;", src: userThumbnail(user), srcFull: userPicture(user) });
        createElement("a", userRow, {text: user.display_name, className:"text-highlighted", href:`/cheat/people/user?id=${user.id}`});
        users.set(user.id, { count: 1, element: userRow });
    }

    let hide = config.hideFromGroups;

    if (!hide) {
        addUser(currentUser);
    }

    for (let user of group.members) {
        if (user) {
            addUser(user);
        }
    }


    function scrollToBottom() {
        requestAnimationFrame(() => messageContainer.scrollTo(0, messageContainer.scrollHeight));
    }

    let atBottom = true;
    messageContainer.addEventListener("scroll", () => {
        atBottom = messageContainer.scrollHeight - messageContainer.clientHeight - messageContainer.scrollTop < 10;
    });
    let connectedCheckInterval = null;
    function onResize() {
        if (atBottom) {
            scrollToBottom();
        }
    }

    return async () => {
        scrollToBottom();
        input.focus();

        window.addEventListener("resize", onResize);
        connectedCheckInterval = setInterval(() => {
            if (!panel.isConnected) {
                window.removeEventListener("resize", onResize);
                clearInterval(connectedCheckInterval);
            }
        }, 1000);

        sendToMessageSock = await openSocket(
            async messageJson => {
                if (!messageContainer.isConnected) {
                    sendToMessageSock("bye");
                    return;
                }

                if (messageJson.identifier && messageJson.identifier === `{\"channel\":\"RoomChannel\",\"room_id\":\"channel${groupId}\"}` && messageJson.message) {
                    if (messageJson.message.messages) {
                        await addMessage(messageJson.message);
                        if (atBottom) {
                            scrollToBottom();
                        }
                    } else if (messageJson.message.user_connected && messageJson.message.user) {
                        if (users.has(messageJson.message.user.id)) {
                            users.get(messageJson.message.user.id).count++;
                        } else {
                            addUser(messageJson.message.user);
                        }
                    } else if (messageJson.message.user_disconnected && messageJson.message.user) {
                        if (users.has(messageJson.message.user.id)) {
                            let tuple = users.get(messageJson.message.user.id);
                            tuple.count--;
                            if (tuple.count <= 0 || (messageJson.message.user.mod && !currentUser.mod)) {
                                users.delete(messageJson.message.user.id);
                                tuple.element.remove();
                            }
                        }
                    }
                }
            },
            send => {
                send({ command: "subscribe", identifier: JSON.stringify({ channel: "RoomChannel", room_id: `channel${groupId}` }) });
                if (hide) {
                    sendToWebSocket({ command: "subscribe", identifier: JSON.stringify({ channel: "RoomChannel", room_id: `channel${groupId}` }) });
                }
            }
        );
    }
}