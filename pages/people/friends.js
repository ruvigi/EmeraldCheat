async function openFriends(panel) {
    createElement("a", panel, {className:"heading", text:`friends`, href:"/cheat/people"});
    let friendsJson = await loadJSON("/friends_json");
    let total = friendsJson.count;
    if (total === 0) {
        createElement("span", panel, {text:"no friends :c"});
        return;
    }
    let loaded = 0;
    let container = createElement("div", panel, { className: "flex-column" });

    function addUsers(users) {
        for (let user of users) {
            let userRow = createElement("a", container, {className:"flex-row center-items", href:`/cheat/people/user?id=${user.id}`});
            createElement("img", userRow, {className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(user)});
            createElement("span", userRow, {text:user.display_name});
        }
        loaded += users.length;
        if (loaded < total) {
            let buttonContainer = createElement("div", container, { className: "flex-column" });
            createElement("a", buttonContainer, { text:`more friends (${loaded}/${total})`, onclick:async e => {
                e.target.innerHTML = "loading...";
                let newUsers = await loadJSON(`/load_friends_json?offset=${loaded}`);
                e.target.parentElement.remove();
                addUsers(newUsers);
            } });
            createElement("a", buttonContainer, { text:`more friends x10`, onclick:async e => {
                e.target.innerHTML = "loading...";
                let newUsers = [];
                for (let i = 0; i < 10 && loaded + newUsers.length < total; i++) {
                    newUsers.push(...await loadJSON(`/load_friends_json?offset=${loaded + newUsers.length}`));
                }
                e.target.parentElement.remove();
                addUsers(newUsers);
            } });
            createElement("a", buttonContainer, { text:`load all`, onclick:async e => {
                e.target.innerHTML = "loading...";
                let newUsers = [];
                while (loaded + newUsers.length < total) {
                    newUsers.push(...await loadJSON(`/load_friends_json?offset=${loaded + newUsers.length}`));
                }
                e.target.parentElement.remove();
                addUsers(newUsers);
            } });
        }
    }

    addUsers(friendsJson.friends);
}

async function openOnlineFriends(panel) {
    createElement("a", panel, {className:"heading", text:`online friends`, href:"/cheat/people"});
    let friendsJson = await loadJSON("/private_friends");
    let users = friendsJson.online;
    if (users.length === 0) {
        createElement("span", panel, {text:"no online friends :c"});
        return;
    }
    let container = createElement("div", panel, { className: "flex-column" });

    for (let user of users) {
        let userRow = createElement("a", container, {className:"flex-row center-items", href:`/cheat/people/user?id=${user.id}`});
        createElement("img", userRow, {className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(user)});
        createElement("span", userRow, {text:user.display_name});
    }
}