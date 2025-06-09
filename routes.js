//renders elements into the page based on the current URL
async function render() {
    if (!currentUser)
        await loadCurrentUser();

    switch (window.location.pathname) {

        case "/cheat/": internalReplaceState("/cheat"); break;


        case "/cheat": //main menu
            loadPage(true, true, (mainPanel, userPanel) => {
                createElement("span", mainPanel, {className:"heading", text:"emeraldcheat"});
                let container = createElement("div", mainPanel, { className: "flex-column menu" });
                if (currentUser.mod) {
                    createElement("a", container, {className:"button", text:"moderate", href:"/cheat/mod"});
                }
                createElement("a", container, {className:"button", text:"duel mode", href:"/cheat/chat/1v1"});
                createElement("a", container, {className:"button", text:"battle royale", href:"/cheat/chat/groups"});
                createElement("a", container, {className:"button", text:"humans", href:"/cheat/people"});
                createElement("a", container, {className:"button", text:"settings", href:"/cheat/settings"});
            });
            break;
        case "/cheat/settings": loadPage(true, true, openSettings); break;
        case "/cheat/settings/quick-bans": loadPage(true, true, openQuickBanSettings); break;
        case "/cheat/notifications": loadPage(false, true, openNotifications); break;
        case "/cheat/messages": loadPage(false, true, openMessages); break;


        case "/cheat/chat/1v1": loadPage(true, true, open1v1); break;
        case "/cheat/chat/direct": loadPage(false, true, openDirectChat); break;
        case "/cheat/chat/groups": loadPage(true, true, openGroups); break;
        case "/cheat/chat/group": loadPage(true, true, openGroup); break;


        case "/cheat/people": //people of walmart
            loadPage(true, false, (mainPanel) => {
                createElement("a", mainPanel, {className:"heading", text:"people", href: "/cheat"});
                let container = createElement("div", mainPanel, { className: "flex-column menu" });
                createElement("a", container, {className:"button", text:"friends", href:"/cheat/people/friends"});
                createElement("a", container, {className:"button", text:"online", href:"/cheat/people/online-friends"});
                createElement("a", container, {className:"button", text:"search", href:"/cheat/people/search"});
                createElement("a", container, {className:"button", text:"me", href:`/cheat/people/user?id=${currentUser.id}`});
            });
            break;
        case "/cheat/people/user": loadPage(false, true, openUser); break;
        case "/cheat/people/friends": loadPage(true, false, openFriends); break;
        case "/cheat/people/online-friends": loadPage(true, false, openOnlineFriends); break;
        case "/cheat/people/search": loadPage(true, false, openSearch); break;


        case "/cheat/mod": //moderation tools
            loadPage(true, false, (mainPanel) => {
                createElement("a", mainPanel, {className:"heading", text:"moderate", href: "/cheat"});
                let container = createElement("div", mainPanel, { className: "flex-column menu" });
                if (config.modAsLists) {
                    createElement("a", container, {className:"button", text:"names", href:"/cheat/mod/queue/display_names"});
                    createElement("a", container, {className:"button", text:"pictures", href:"/cheat/mod/queue/pictures"});
                } else {
                    createElement("a", container, {className:"button", text:"queue", href:"/cheat/mod/queue"});
                }
                createElement("a", container, {className:"button", text:"reports", href:"/cheat/mod/reports"});
                createElement("a", container, {className:"button", text:"spam", href:"/cheat/mod/spam"});
                createElement("a", container, {className:"button", text:"videos", href:"/cheat/mod/videos"});
            });
            break;
        case "/cheat/mod/user": loadPage(false, true, openUserModOptions); break;
        case "/cheat/mod/custom-ban": loadPage(false, true, openCustomBanPage); break;
        case "/cheat/mod/queue": loadPage(true, true, openQueue); break;
        case "/cheat/mod/queue/display_name": loadPage(true, true, openNameRequest); break;
        case "/cheat/mod/queue/picture": loadPage(true, true, openPictureRequest); break;
        case "/cheat/mod/queue/display_names": loadPage(true, true, openNameRequests); break;
        case "/cheat/mod/queue/pictures": loadPage(true, true, openPictureRequests); break;
        case "/cheat/mod/reports": loadPage(true, true, openReports); break;
        case "/cheat/mod/report": loadPage(true, true, openReport); break;
        case "/cheat/mod/spam": loadPage(true, true, openSpam); break;
        case "/cheat/mod/spammer": loadPage(true, true, openSpamDetection); break;
        case "/cheat/mod/videos": loadPage(true, true, openVideos); break;
        case "/cheat/mod/video": loadPage(true, true, openVideo); break;


        default: loadPage(true, false, mainPanel => mainPanel.innerHTML = "not found :("); break;
    }
}

function query(key) {
    try {
        return new URLSearchParams(window.location.search).get(key);
    } catch {
        return null;
    }
}