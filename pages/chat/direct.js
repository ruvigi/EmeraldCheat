async function openDirectChat(panel) {
    let userId = parseInt(query("id"));
    if (!userId) return;
    let userJson = await loadJSON(`/profile_json?id=${userId}`);
    if (!userJson) return;
    let user = userJson.user;
    if (!user) return;

    let titleRow = createElement("div", panel, { className: "flex-row block-grow center-items" });

    createElement("img", titleRow, { className: "image", style: "width: 3rem; height: 3rem", src: userThumbnail(user), srcFull: userPicture(user) });

    createElement("a", titleRow, { className: "heading", text: user.display_name, href: `/cheat/people/user?id=${userId}` });

    let messageContainer = createElement("div", panel, { className: "flex-grow-1 fill-width flex-column", style: "overflow: hidden auto;" });

    if (!userJson.friend) {
        createElement("span", messageContainer, { text: "not buds :(" });
        return;
    }

    createElement("div", messageContainer, { style: "flex: 1 1 auto;" });

    let messagesJson = await loadJSON(`/default_private_messages?id=${userJson.room_id}`);
    if (!messagesJson) return;
    
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
            createElement("img", lastColumn, { className: "image censored", style: "width: 9rem; height: 9rem;", src: message.picture });
        }

        for (let line of message.messages) {
            let imageUrl = decodeURIComponent(line).split(" ").find(word => word.startsWith("i.imgur.com/") && !word.includes("@"));
            if (imageUrl) {
                createElement("img", lastColumn, { className: "image censored", style: "width: 9rem; height: 9rem;", src: `https://${imageUrl}` });
            } else {
                createElement("span", lastColumn, { text: line });
            }
        }
    }

    for (let message of messagesJson.messages) {
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
                room_id: userJson.room_id,  
            }),
            data: JSON.stringify({
                message: input.value,
                id: userJson.room_id,
                mode: "private",
                action: "speak"
            })
        });
        input.value = "";
    });
    function typing() {
        sendToMessageSock({
            command: "message",
            identifier: JSON.stringify({
                channel: "RoomChannel",
                room_id: userJson.room_id,  
            }),
            data: JSON.stringify({
                id: userJson.room_id,
                action: "typing"
            })
        });
    }
    let typingInterval;
    let typingTimeout;
    input.addEventListener('input', () => {
        if (!typingInterval) {
            typing();
            typingInterval = setInterval(typing, 1000);
        }

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            clearInterval(typingInterval);
            typingInterval = null;
        }, 1000);
    });
    input.setAttribute("autofocus", "");

    function scrollToBottom() {
        requestAnimationFrame(() => messageContainer.scrollTo(0, messageContainer.scrollHeight));
    }

    let typingUsers = new Map();

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

                if (messageJson.identifier && messageJson.identifier === `{\"channel\":\"RoomChannel\",\"room_id\":${userJson.room_id}}` && messageJson.message) {
                    if (messageJson.message.messages) {
                        await addMessage(messageJson.message);
                        if (atBottom) {
                            scrollToBottom();
                        }
                        if (messageJson.message.user && messageJson.message.user.id !== currentUser.id) {
                            let eventUserId = messageJson.message.user.id;
                            let timeout = typingUsers.get(eventUserId);
                            if (timeout) {
                                clearTimeout(timeout);
                            }
                            typingUsers.delete(eventUserId);
                            if (typingUsers.size === 0) {
                                input.classList.remove("typing");
                            }
                        }
                    } else if (messageJson.message.typing) {
                        if (messageJson.message.user && messageJson.message.user.id !== currentUser.id) {
                            let eventUserId = messageJson.message.user.id;
                            let timeout = typingUsers.get(eventUserId);
                            if (timeout) {
                                clearTimeout(timeout);
                            } else if (typingUsers.size === 0) {
                                input.classList.add("typing");
                            }
                            typingUsers.set(eventUserId, setTimeout(() => {
                                typingUsers.delete(eventUserId);
                                if (typingUsers.size === 0) {
                                    input.classList.remove("typing");
                                }
                            }, 10000));
                        }
                    }
                }
            },
            send => {
                send({ command: "subscribe", identifier: JSON.stringify({ channel: "RoomChannel", room_id: userJson.room_id }) });
            }
        );
    }
}