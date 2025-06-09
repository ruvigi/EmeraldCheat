let config = getStorageJSON("cheatConfig") ?? {};

let sendToWebSocket;

//startup - either inject a button or load the cheat
if (window.location.pathname == "/cheat" || window.location.pathname.startsWith("/cheat/")) {
    init();
} else if (window.location.pathname === "/app") {
    window.addEventListener("load", inject, false);
}

//injects a button to navigate to the cheat
function inject() {
    let burgerContent = document.querySelector(".navigation-dropdown-content");
    let cheatMenuOpener = document.createElement("li");
    cheatMenuOpener.innerText = "EmeraldCheat";
    cheatMenuOpener.addEventListener("click", () => window.location.assign("/cheat"));
    burgerContent.prepend(cheatMenuOpener);
}

//loads the cheat page
async function init() {
    document.firstElementChild.innerHTML = source;

    let wrappers = document.getElementsByClassName("wrapper");
    let panels = document.getElementsByClassName("panel");
    let focusButtons = document.getElementsByClassName("focus-button");
    panelData = [
        { panel: panels[0], wrapper: wrappers[0], button: focusButtons[0] },
        { panel: panels[1], wrapper: wrappers[1], button: focusButtons[1] }
    ];
    focusButtons[0].addEventListener("click", () => focusPanel(0));
    focusButtons[1].addEventListener("click", () => focusPanel(1));
    msgsButton = document.getElementsByClassName("msgs-button")[0];
    notiButton = document.getElementsByClassName("noti-button")[0];
    
    if (!currentUser)
        await loadCurrentUser();

    window.addEventListener("click", e => {
        if (e.target.closest("a")) {
            if (e.target.closest("a").getAttribute("href") && (e.target.closest("a").getAttribute("href").startsWith("/cheat/") || e.target.closest("a").getAttribute("href") == "/cheat") && !e.ctrlKey) {
                e.preventDefault();
                internalPushState(e.target.closest("a").getAttribute("href"));
            }
        } else if (e.target.matches("img")) {
            if (e.target.classList.contains("fullscreen")) {
                e.target.remove();
            } else {
                let srcFull = e.target.getAttribute("data-src-full");

                let newNode = e.target.cloneNode();
                newNode.className = "image fullscreen";
                newNode.style = "";
                document.body.append(newNode);
                if (srcFull) {
                    preloadImage(srcFull, newNode);
                }
            }
        }
    });
    document.addEventListener("keydown", callOnKeyDown);
    window.addEventListener("popstate", render);
    await stealFromApp();
    database = await openDatabase();
    deleteExpiredPictures();
    sendToWebSocket = await openSocket(
        m => {
            if (!m.identifier) return;
            let identifier = JSON.parse(m.identifier);
            if (identifier.channel === "EventsChannel" && m.message) {
                if (m.message.notification_update === true) {
                    if (!notiButton.classList.contains("text-gold")) {
                        notiButton.classList.add("text-gold");
                    }
                    document.title = "(1) EmeraldCheat";
                } else if (m.message.message_notification === true) {
                    if (!msgsButton.classList.contains("text-gold")) {
                        msgsButton.classList.add("text-gold");
                    }
                    document.title = "(1) EmeraldCheat";
                }
            } else if (identifier.channel === "RoomChannel" && m.type === "confirm_subscription") {
                sendToWebSocket({ command: "unsubscribe", identifier: JSON.stringify({ channel: "RoomChannel", room_id: identifier.room_id }) });
            }
        },
        send => {
            send({ command: "subscribe", identifier: JSON.stringify({ channel: "EventsChannel" }) });
        }
    );
    await render();
    let messagesPromise = loadJSON("/message_notifications_json");
    let notificationsPromise = loadJSON("/notifications_json");
    if ((await messagesPromise).unread.length > 0) {
        msgsButton.classList.add("text-gold");
        document.title = "(1) EmeraldCheat";
    }
    let notificationsJson = await notificationsPromise;
    if (notificationsJson.unread.length > 0 || notificationsJson.friend_requests.length > 0) {
        notiButton.classList.add("text-gold");
        document.title = "(1) EmeraldCheat";
    }
    msgsButton.classList.remove("text-inactive");
    notiButton.classList.remove("text-inactive");
}