//any tags that include any of these will be highlighted as they are ban-worthy
const susInterestParts = ["mlm", "alm", "mla", "shota", "pdo", "creep", "creepy", "pervert", "molest", "session", "zoophilia", "minecraft", "jailbait", "cunny", "tween", "preteen", "underaged", "dad", "perv", "zoo", "taboo", "pdf", "lxli", "ped", "pedo", "pedophile", "pedophilia", "pxd", "pxdo", "yng", "young", "baby", "toddler", "newborn", "dog", "dogs", "horse", "horses", "horse cock", "rape", "rxpe", "rapist", "minor", "minors", "underage", "map", "aam", "kid", "kids", "cartography", "vid", "vids", "trade", "trading", "mega", "link", "links", "little", "beast", "beastiality", "knot", "dog knot", "loli", "lolita", "school", "high school", "middle school", "elementary", "elementary school", "mom", "mum", "mother", "cousin", "uncle", "father", "sis", "bro", "sibling", "siblings", "teen", "teens", "boy", "boys", "child", "children", "roblox", "fortnite", "brother", "sister", "incest", "grandma", "grandmother", "grandpa", "grandfather", "family", "niece", "aunt", "daughter", "son", "groom", "grooming", "groomed", "robux"];

//opens the user panel for the given user ID
async function openUser(panel, userId) {
    userId ??= parseInt(query("id"));
    if (!userId) return;
    let userJson = await loadJSON(`/profile_json?id=${userId}`);
    if (!userJson) return;
    let user = userJson.user;
    if (!user) return;

    await addUserHeader(panel, userJson, true);

    if (currentUser.mod) {
        let quickBanContainer = createElement("div", panel, {className:"quick-bans"});

        let banOptions = [];
        if (user.temp) {
            banOptions.push({ name: "cp/csa", duration: ban3d.value, reason: banCSA.value });
            banOptions.push({ name: "illegal", duration: ban3d.value, reason: banIllegal.value });
        } else {
            banOptions.push({ name: "any illegal", duration: ban10y.value, reason: banPerm.value });
        }
        banOptions.push(...quickBans);

        for (let quickBan of banOptions) {
            createElement("a", quickBanContainer, {className:"small-button", text:quickBan.name, onclick:async e => {
                if (e.target.classList.contains("confirm")) {
                    e.target.classList.remove("confirm");
                    e.target.innerHTML = "banning...";
                    await banUser(user.id, quickBan.duration, quickBan.reason);
                    if (quickBan.duration >= ban10y.value) {
                        navigator.clipboard.writeText(`${user.platinum||user.gold?"[Paying user]\n":""}${user.display_name} #${user.username} // ${user.id}\n`);
                    }
                    e.target.innerHTML = quickBan.name;
                    if (!e.target.classList.contains("text-highlighted")) {
                        e.target.classList.add("text-highlighted");
                    }
                } else {
                    e.target.classList.add("confirm");
                }
            } });
        }
    }

    if (user.bio !== "This user has not filled in their profile yet")
        createElement("span", panel, {className:"text-centered", text:user.bio});

    if (user.interests.length > 0) {
        let interestContainer = createElement("div", panel, {className:"interests"});
        for (let interest of user.interests) {
            createElement("span", interestContainer, {text:interest.name, className:susInterestParts.some(p => interest.name.split(" ").includes(p) || interest.name === p.split("").join(" ")) ? "text-red" : ""});
        }
    }

    let feedJson = await loadJSON(`/microposts_default?id=${userJson.wall_id}`);
    if (!feedJson) {
        alert("couldn't load feed :(");
    } else {
        let postForm = createElement("form", panel, { className: "fill-width" });
        let postInput = createElement("input", postForm, {className:"fill-width normal-input"});
        postInput.setAttribute("placeholder", "post something...");
        let feedContainer;

        async function addPost(poster, timestamp, content, postId, commentIds, prepend) {
            let postRow = createElement("div", feedContainer, {className:"flex-row fill-width", prepend: prepend});
            createElement("img", postRow, {className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(poster), srcFull:userPicture(poster)});
            let postColumn = createElement("div", postRow, {className:"flex-grow-1 flex-column flex-block-overflow"});
            let postMainColumn = createElement("div", postColumn, {className:"flex-column fill-width gap-0"});
            let postHeading = createElement("div", postMainColumn, {className:"flex-row center-items"});
            createElement("a", postHeading, {text:poster.display_name, className:"text-highlighted", href:`/cheat/people/user?id=${poster.id}`});
            createElement("span", postHeading, {text:timeSince(timestamp), style:"font-size: 0.75rem"});
            createElement("span", postMainColumn, {text:content});
            await addComments(postColumn, commentIds, postId);
        }

        postForm.addEventListener("submit", async e => {
            e.preventDefault();
            let post = await sendActionRequest(`/microposts_create?id=${userJson.wall_id}&content=${encodeURIComponent(postInput.value)}&picture=`, "GET");
            await addPost(currentUser, new Date().toISOString(), postInput.value, post.micropost.id, [], true);
            postInput.value = "";
        });

        let feed = feedJson.microposts;
        feedContainer = createElement("div", panel, {className:"flex-column"});
        let nextIndex = 0;
        async function loadNextPosts() {
            let promises = [];
            let limit = Math.min(nextIndex + 3, feed.length);
            while (nextIndex < limit) {
                let postId = feed[nextIndex];
                nextIndex++;
                let post = await loadJSON(`/micropost_json?id=${postId}`, true);
                if (!post) continue;
                promises.push(addPost(post.author, post.micropost.created_at, post.micropost.content, postId, post.comments, false));
            }
            if (nextIndex < feed.length) {
                createElement("a", feedContainer, { text:`older posts (${limit}/${feed.length})`, onclick:e => { e.target.remove(); loadNextPosts(); } });
            }
            for (let promise of promises) {
                await promise;
            }
        }
        await loadNextPosts();
    }
}

async function addComments(element, commentIds, postId) {
    let commentForm = createElement("form", element, { className: "flex-grow-1"});
    let commentInput = createElement("input", commentForm, { className: "fill-width normal-input" });
    commentInput.setAttribute("placeholder", "comment something...");

    function addComment(commenter, timestamp, content, prepend) {
        let commentRow = createElement("div", element, {className:"flex-row fill-width", after: prepend ? commentForm : null});
        createElement("img", commentRow, {className:"image flex-grow-0", style:"width: 2.125rem; height: 2.125rem;", src:userThumbnail(commenter), srcFull:userPicture(commenter)});
        let commentColumn = createElement("div", commentRow, {className:"flex-grow-1 flex-column gap-0 flex-block-overflow"});
        let commentHeading = createElement("div", commentColumn, {className:"flex-row center-items"});
        createElement("a", commentHeading, {text:commenter.display_name, className:"text-highlighted", style:"font-size: 0.75rem", href:`/cheat/people/user?id=${commenter.id}`});
        createElement("span", commentHeading, {text:timeSince(timestamp), style:"font-size: 0.625rem"});
        createElement("span", commentColumn, {text:content, style:"font-size: 0.75rem"});
    }

    commentForm.addEventListener("submit", async e => {
        e.preventDefault();
        await sendActionRequest(`/comments_create?id=${postId}&content=${encodeURIComponent(commentInput.value)}`, "GET");
        addComment(currentUser, new Date().toISOString(), commentInput.value, true);
        commentInput.value = "";
    });
    

    let nextIndex = 0;
    async function loadNextComments() {
        let limit = Math.min(nextIndex + 3, commentIds.length);
        while (nextIndex < limit) {
            let commentId = commentIds[nextIndex];
            nextIndex++;
            let commentJson = await loadJSON(`/comment_json?id=${commentId}`, true);
            if (!commentJson) continue;
            addComment(commentJson.user, commentJson.comment.created_at, commentJson.comment.content, false);
        }
        if (nextIndex < commentIds.length) {
            createElement("a", element, { text:`older comments (${limit}/${commentIds.length})`, onclick:e => { e.target.remove(); loadNextComments(); } });
        }
    }
    await loadNextComments();
}

async function addUserHeader(panel, userJson, isMain) {
    let user = userJson.user;
    let statusJson = currentUser.mod ? await loadJSON(`/user_status?id=${userJson.user.id}`, true) : null;

    let mainRow = createElement("div", panel, {className:"flex-row", style:"align-items: start"});

    createElement("img", mainRow, {className:"image", style:"width: 8.5rem; height: 8.5rem", src:user.display_picture});

    let detailCol = createElement("div", mainRow, {className:"flex-grow-1 flex-column", style:"gap: 0.25rem"});
    createElement("a", detailCol, {className:"heading" + (statusJson && statusJson.banned ? " text-red" : ""), text:user.display_name, href:"/cheat/people"});
    createElement("span", detailCol, {text:`${user.karma} pts, ${translateGender(user.gender)}`});
    createElement("span", detailCol, {text:user.online ? "online now" : ("online " + timeSince(user.last_logged_in_at)), style: Math.floor(new Date() - new Date(user.last_logged_in_at)) > 1800000 && !user.online ? " color: var(--red);" : null});
    createElement("span", detailCol, {text:`${"joined " + timeSince(user.created_at)}`});
    createElement("span", detailCol, {text:roleName(user), style:user.mod||user.master?"color: var(--accent);":user.gold||user.platinum?"color: var(--gold);":null});

    createElement("span", panel, {text:"#"+user.username, className:"flex-block-overflow"});

    let buttonRow = createElement("div", panel, {className:"flex-row"});
    if (currentUser.mod) {
        if (isMain) {
            createElement("a", buttonRow, { className:"button", text:"mod", href:`/cheat/mod/user?id=${user.id}` });
        } else {
            createElement("a", buttonRow, { className:"button", text:"back", onclick:e => window.history.back() });
        }
    }
    if (user.id !== currentUser.id) {
        let removeElement, pendingElement, addElement, messageElement;
        removeElement = createElement("a", buttonRow, { text: "remove", className: "button hidden", onclick: async e => { await sendActionRequest(`/friends_destroy?id=${user.id}`); removeElement.classList.add("hidden"); addElement.classList.remove("hidden"); messageElement.classList.add("hidden"); } });
        pendingElement = createElement("a", buttonRow, { text: "pending", className: "button hidden", onclick: async e => { await sendActionRequest(`/friends_destroy?id=${user.id}`); pendingElement.classList.add("hidden"); addElement.classList.remove("hidden"); } });
        addElement = createElement("a", buttonRow, { text: "add", className: "button hidden", onclick: async e => { await sendActionRequest(`/friend_create?friend_id=${user.id}`); addElement.classList.add("hidden"); pendingElement.classList.remove("hidden"); } });
        messageElement = createElement("a", buttonRow, { text: "message", className: "button hidden", href: `/cheat/chat/direct?id=${user.id}` });

        if (userJson.friend) {
            removeElement.classList.remove("hidden");
            messageElement.classList.remove("hidden");
        } else if (userJson.friend_request_sent) {
            pendingElement.classList.remove("hidden");
        } else {
            addElement.classList.remove("hidden");
        }
    }
}