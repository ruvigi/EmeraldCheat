async function open1v1(panel, userPanel) {
    let roomId = query("id");
    if (roomId) {
        return await open1v1Channel(panel, userPanel, roomId);
    }

    let sendToMessageSock;
    return async () => {
        sendToMessageSock = await openSocket(
            async messageJson => {
                if (!panel.isConnected) {
                    sendToMessageSock("bye");
                    return;
                }

                if (messageJson.identifier && messageJson.identifier === `{\"channel\":\"MatchChannel\"}`) {
                    if (messageJson.type === "confirm_subscription") {
                        sendToMessageSock({
                            command: "message",
                            identifier: "{\"channel\":\"MatchChannel\"}",
                            data: JSON.stringify({
                                interest_wait: false,
                                options: {
                                    karma_filter: false,
                                    min_karma: 3,
                                    filter_temps: true,
                                    gender_filter: false,
                                    gender_selected: "f",
                                    country_filter: false,
                                    countries_selected: [],
                                    language_filter: false,
                                    language_selected: "English",
                                    intimacy_filter: false,
                                    intimacy_selected: "false"
                                },
                                id: null,
                                queue: "text",
                                action: "match"
                            })
                        });
                    } else if (messageJson.message && messageJson.message.room_id) {
                        internalReplaceState(`/cheat/chat/1v1?id=${messageJson.message.room_id}&u=${messageJson.message.room_data.partner.id}`);
                    }
                }
            },
            send => {
                send({ command: "subscribe", identifier: JSON.stringify({ channel: "MatchChannel" }) });
            }
        );
    }
}

async function open1v1Channel(panel, userPanel, roomId) {
    let userId = parseInt(query("u"));
    await openUser(userPanel, userId);

    createElement("a", panel, { className: "heading", text: "1v1", href: "/cheat/chat/1v1" });

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

    let sendToMessageSock;

    let form = createElement("form", panel, { className:"fill-width" });
    let input = createElement("input", form, { className:"fill-width" });
    form.addEventListener("submit", e => {
        e.preventDefault();
        sendToMessageSock({
            command: "message",
            identifier: JSON.stringify({
                channel: "RoomChannel",
                room_id: roomId,  
            }),
            data: JSON.stringify({
                message: input.value,
                id: roomId,
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
                room_id: roomId,  
            }),
            data: JSON.stringify({
                id: roomId,
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

    function handleKeyDown(e) {
        if (e.ctrlKey) return;
        switch (e.key) {
            case "Escape":
                e.preventDefault();
                internalPushState("/cheat/chat/1v1");
                break;
        }
    }
    onKeyDown = handleKeyDown;
    input.addEventListener("keydown", handleKeyDown);


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

                if (messageJson.identifier && messageJson.identifier === `{\"channel\":\"RoomChannel\",\"room_id\":\"${roomId}\"}` && messageJson.message) {
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
                    } else if (messageJson.message.user_disconnected) {
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
                        createElement("a", messageContainer, { text: "next bitch!", className: "button", href: "/cheat/chat/1v1", style: "width: fit-content; margin: 0.25rem;" });
                        scrollToBottom();
                    }
                }
            },
            send => {
                send({ command: "subscribe", identifier: JSON.stringify({ channel: "RoomChannel", room_id: roomId }) });
            }
        );
    }
}