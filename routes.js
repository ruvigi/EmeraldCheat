//renders elements into the page based on the current URL
async function render() {
    try {
        if (!currentUser)
            await loadCurrentUser();

        switch (window.location.pathname) {

            case "/cheat/": internalReplaceState("/cheat"); break;


            case "/cheat": //main menu
                await loadPage(true, true, (mainPanel, userPanel) => {
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
            case "/cheat/settings": await loadPage(true, true, openSettings); break;
            case "/cheat/settings/quick-bans": await loadPage(true, true, openQuickBanSettings); break;
            case "/cheat/notifications": await loadPage(false, true, openNotifications); break;
            case "/cheat/messages": await loadPage(false, true, openMessages); break;


            case "/cheat/chat/1v1": await loadPage(true, true, open1v1); break;
            case "/cheat/chat/direct": await loadPage(false, true, openDirectChat); break;
            case "/cheat/chat/groups": await loadPage(true, true, openGroups); break;
            case "/cheat/chat/group": await loadPage(true, true, openGroup); break;


            case "/cheat/people": //people of walmart
                await loadPage(true, false, (mainPanel) => {
                    createElement("a", mainPanel, {className:"heading", text:"people", href: "/cheat"});
                    let container = createElement("div", mainPanel, { className: "flex-column menu" });
                    createElement("a", container, {className:"button", text:"friends", href:"/cheat/people/friends"});
                    createElement("a", container, {className:"button", text:"online", href:"/cheat/people/online-friends"});
                    createElement("a", container, {className:"button", text:"search", href:"/cheat/people/search"});
                    createElement("a", container, {className:"button", text:"me", href:`/cheat/people/user?id=${currentUser.id}`});
                });
                break;
            case "/cheat/people/user": await loadPage(false, true, openUser); break;
            case "/cheat/people/friends": await loadPage(true, false, openFriends); break;
            case "/cheat/people/online-friends": await loadPage(true, false, openOnlineFriends); break;
            case "/cheat/people/search": await loadPage(true, false, openSearch); break;


            case "/cheat/mod": //moderation tools
                await loadPage(true, false, (mainPanel) => {
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
            case "/cheat/mod/user": await loadPage(false, true, openUserModOptions); break;
            case "/cheat/mod/custom-ban": await loadPage(false, true, openCustomBanPage); break;
            case "/cheat/mod/queue": await loadPage(true, true, openQueue); break;
            case "/cheat/mod/queue/display_name": await loadPage(true, true, openNameRequest); break;
            case "/cheat/mod/queue/picture": await loadPage(true, true, openPictureRequest); break;
            case "/cheat/mod/queue/display_names": await loadPage(true, true, openNameRequests); break;
            case "/cheat/mod/queue/pictures": await loadPage(true, true, openPictureRequests); break;
            case "/cheat/mod/reports": await loadPage(true, true, openReports); break;
            case "/cheat/mod/report": await loadPage(true, true, openReport); break;
            case "/cheat/mod/spam": await loadPage(true, true, openSpam); break;
            case "/cheat/mod/spammer": await loadPage(true, true, openSpamDetection); break;
            case "/cheat/mod/videos": await loadPage(true, true, openVideos); break;
            case "/cheat/mod/video": await loadPage(true, true, openVideo); break;


            default: await loadPage(true, false, mainPanel => mainPanel.innerHTML = "not found :("); break;
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
        alert(error.stack);
    }
}

function query(key) {
    try {
        return new URLSearchParams(window.location.search).get(key);
    } catch {
        return null;
    }
}