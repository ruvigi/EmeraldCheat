const childWords = ["cheerleader", "gymnastics", "gymnast", "maps", "shxta", "pred", "shotacon", "lolicon", "teen", "teens", "mega", "link", "links", "yng", "young", "creep", "teenager", "infant", "cp", "cheese pizza", "cheesepizza", "sixteen", "seventeen", "twelve", "preteens", "fifteen", "fourteen", "thirteen", "cub", "mlm", "alm", "mla", "shota", "pdo", "molest", "jailbait", "cunny", "tween", "preteen", "underaged", "pdf", "lxli", "ped", "pedo", "pedophile", "pedophilia", "pxd", "pxdo", "toddler", "newborn", "minor", "minors", "underage", "map", "aam", "cartography", "loli", "lolita", "middle school", "elementary", "elementary school", "child", "children", "groomed"];
const childWithSexualWords = ["roblox", "fortnite", "robux", "vid", "vids", "sitting", "babysitting", "file", "highschool", "high school", "groom", "groomer", "grooming", "creepy", "session", "minecraft", "kid", "kids", "yung"];
const illegalWords = ["brother", "sister", "father", "snuff", "necro", "zoophilia", "rape", "rxpe", "rapist", "beastiality", "bestiality", "knot", "dog knot", "cousin", "uncle", "sibling", "siblings", "incest", "grandmother", "grandfather", "family", "niece", "aunt", "daughter", "son"];
const illegalWithSexualWords = ["sis", "dog", "dogs", "horse", "horses", "parent", "parents", "zoo", "beast", "taboo"];
const sexualWords = ["cumshot", "facial", "nipples", "cleavage", "paag", "thicc", "leggings", "booty", "ass", "panties", "size queen", "macromastia", "girth", "girthy", "diaper", "cuck", "diapered", "diapers", "abdl", "potty", "bedwetting", "bedwetter", "cumslut", "nolimits", "spanking", "spank", "choke", "choking", "obedient", "ftm", "mtf", "blackmail", "hypno", "hypnosis", "hypnotize", "smut", "voyeur", "blowjob", "bj", "nudism", "nudist", "cheating", "pregnant", "race play", "use me", "exhibitionist", "dominant", "humiliate", "humiliated", "degrading", "humiliation", "kink", "bdsm", "gang bang", "cuckold", "gooned", "ovulating", "nympho", "groping", "creampie", "foreplay", "condom", "fingering", "twink", "free use", "age play", "degrade", "degradation", "degraded", "ddlg", "femboy", "trans", "dom", "femdom", "dominatrix", "domme", "slave", "chastity", "doggy", "pegging", "petplay", "naughty", "submissive", "sub", "age gap", "gooning", "gooner", "wank", "joi", "hookup", "squirt", "butt", "buttslut", "virgin", "sugar baby", "hot", "cnc", "goonette", "pawg", "blacked", "anal", "threesome", "stepdad", "stepfather", "step sis", "step dad", "step bro", "hung", "fwb", "bimbo", "milf", "brainwashing", "brainwashed", "brainwash", "pervert", "perv", "perverted", "pervy", "bop", "slut", "whore", "furry", "roleplay", "rp", "gay", "bi", "lesbian", "dick", "moan", "flashing", "tits", "boobs", "cum", "orgasm", "orgasms", "wet", "snow bunny", "snowbunny", "glory hole", "gloryhole", "horny", "goon", "pussy", "daddy", "mommy", "breasts", "breeding", "bbc", "bwc", "jerk", "jerking", "bikini", "jizz"];

//opens the user panel for the given user ID
async function openUser(panel, userId) {
    panel.innerHTML = "";
    userId ??= parseInt(query("id"));
    if (!userId) return;
    let userJson = await loadJSON(`/profile_json?id=${userId}`);
    if (!userJson) return;
    let user = userJson.user;
    if (!user) return;
    let entry = await collectUser(user, "profile");

    let mainRow = createElement("div", panel, {className:"flex-row", style:"align-items: start"});

    createElement("img", mainRow, {className:"image", style:"width: 8.5rem; height: 8.5rem", src:user.display_picture});

    let detailCol = createElement("div", mainRow, {className:"flex-grow-1 flex-column", style:"gap: 0.25rem"});
    createElement("a", detailCol, {className:"heading", text:user.display_name, href:"/cheat/people"});
    createElement("span", detailCol, {text:`${user.karma} pts, ${translateGender(entry.gender)}`});
    createElement("span", detailCol, {text:user.online ? "online now" : ("online " + timeSince(user.last_logged_in_at)), style: Math.floor(new Date() - new Date(user.last_logged_in_at)) > 1800000 && !user.online ? " color: var(--red);" : null});
    createElement("span", detailCol, {text:`${"joined " + timeSince(user.created_at)}`});
    createElement("span", detailCol, {text:roleName(user), style:user.mod||user.master?"color: var(--accent);":user.gold||user.platinum?"color: var(--gold);":null});

    createElement("span", panel, {text:"#"+user.username, className:"flex-block-overflow"});

    let buttonRow = createElement("div", panel, {className:"flex-row"});
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

    if (user.bio !== "This user has not filled in their profile yet")
        createElement("span", panel, {className:"text-centered", text:user.bio});

    let factsContainer = createElement("div", panel, {className:"facts"});
    let noteText;
    noteText = createElement("span", factsContainer, {className:"text-centered", text:entry.note ?? "no note", onclick: async e => {
        let newNote = prompt("enter a note").trim();
        if (newNote == "")
            newNote = null;
        entry = await getDatabaseJSON("KnownUsers", entry.key);
        entry.note = newNote;
        await setDatabaseJSON("KnownUsers", entry);
        noteText.innerText = newNote ?? "no note";
    }});
    createElement("span", factsContainer, {className:"text-centered", text:"met " + timeSince(entry.firstSeen.timestamp) + " in " + entry.firstSeen.context});
    if (entry.key === 12859457)
        createElement("span", factsContainer, {className:"text-centered text-green", text:"developer"});
    else if (entry.location && entry.language)
        createElement("span", factsContainer, {className:"text-centered", text:entry.location.toLowerCase() + ", " + entry.language.split(';')[0].toLowerCase()});
    if (entry.names.length > 1)
        createElement("span", factsContainer, {className:"text-centered", text:"other names: " + entry.names.filter(n => n !== user.display_name).join(", ")});
    if (user.hide_interests)
        createElement("span", factsContainer, {className:"text-centered", text:"interests are hidden!"});

    if (entry.interests && entry.interests.length > 0) {
        let interestContainer = createElement("div", panel, {className:"interests"});
        for (let interest of entry.interests) {
            if (currentUser.id !== user.id && currentUser.interests.some(mine => mine.name == interest)) {
                createElement("span", interestContainer, {text:interest, className: "text-green"});
            } else if (interestMatchesWords(interest, childWords) || interestMatchesWords(interest, illegalWords)) {
                createElement("span", interestContainer, {text:interest, className: "text-red"});
            } else if (interestMatchesWords(interest, childWithSexualWords) || interestMatchesWords(interest, illegalWithSexualWords)) {
                createElement("span", interestContainer, {text:interest, className: "text-gold"});
            } else if (interestMatchesWords(interest, sexualWords)) {
                createElement("span", interestContainer, {text:interest, className: "text-highlighted"});
            } else {
                createElement("span", interestContainer, {text:interest});
            }
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

        async function addPost(poster, timestamp, content, postId, commentIds, commentsCount, prepend) {
            let postRow = createElement("div", feedContainer, {className:"flex-row fill-width", prepend: prepend});
            createElement("img", postRow, {className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(poster), srcFull:userPicture(poster)});
            let postColumn = createElement("div", postRow, {className:"flex-grow-1 flex-column flex-block-overflow"});
            let postMainColumn = createElement("div", postColumn, {className:"flex-column fill-width gap-0"});
            let postHeading = createElement("div", postMainColumn, {className:"flex-row center-items"});
            createElement("a", postHeading, {text:poster.display_name, className:"text-highlighted", href:`/cheat/people/user?id=${poster.id}`});
            createElement("span", postHeading, {text:timeSince(timestamp), style:"font-size: 0.75rem"});
            createElement("span", postMainColumn, {text:content});
            await addComments(postColumn, commentIds, postId, commentsCount, userJson.friend);
        }

        postForm.addEventListener("submit", async e => {
            e.preventDefault();
            if (userJson.friend) {
                let post = await sendActionRequest(`/microposts_create?id=${userJson.wall_id}&content=${encodeURIComponent(postInput.value)}&picture=`, "GET");
                await addPost(currentUser, new Date().toISOString(), postInput.value, post.micropost.id, [], 0, true);
                postInput.value = "";
            } else {
                alert("can't post because it's not a friend :(");
            }
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
                promises.push(addPost(post.author, post.micropost.created_at, post.micropost.content, postId, post.comments, post.comments_count, false));
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

async function addComments(element, commentIds, postId, commentsCount, isFriend) {
    let commentForm = createElement("form", element, { className: "flex-grow-1"});
    let commentInput = createElement("input", commentForm, { className: "fill-width normal-input" });
    commentInput.setAttribute("placeholder", "comment something...");
    let highestItem = commentForm;

    function addComment(commenter, timestamp, content, isNew) {
        let commentRow = createElement("div", element, {className:"flex-row fill-width", before: isNew ? commentForm : highestItem});
        highestItem = commentRow;
        createElement("img", commentRow, {className:"image flex-grow-0", style:"width: 2.125rem; height: 2.125rem;", src:userThumbnail(commenter), srcFull:userPicture(commenter)});
        let commentColumn = createElement("div", commentRow, {className:"flex-grow-1 flex-column gap-0 flex-block-overflow"});
        let commentHeading = createElement("div", commentColumn, {className:"flex-row center-items"});
        createElement("a", commentHeading, {text:commenter.display_name, className:"text-highlighted", style:"font-size: 0.75rem", href:`/cheat/people/user?id=${commenter.id}`});
        createElement("span", commentHeading, {text:timeSince(timestamp), style:"font-size: 0.625rem"});
        createElement("span", commentColumn, {text:content, style:"font-size: 0.75rem"});
    }

    commentForm.addEventListener("submit", async e => {
        e.preventDefault();
        if (isFriend) {
            await sendActionRequest(`/comments_create?id=${postId}&content=${encodeURIComponent(commentInput.value)}`, "GET");
            addComment(currentUser, new Date().toISOString(), commentInput.value, true);
            commentInput.value = "";
        } else {
            alert("can't post because it's not a friend :(");
        }
    });
    

    let nextIndex = 0;
    async function loadNextComments() {
        let limit = Math.min(nextIndex + 4, commentsCount);
        while (isFriend && commentIds.length < limit) {
            let loadMoreJson = await sendActionRequest(`/comments_load_more?id=${postId}&loaded=${commentIds.length}&load_count=10`, "GET");
            for (let commentId of loadMoreJson) {
                commentIds.push(commentId);
            }
        }
        while (nextIndex < limit) {
            let commentId = commentIds[nextIndex];
            nextIndex++;
            let commentJson = await loadJSON(`/comment_json?id=${commentId}`, true);
            if (!commentJson) continue;
            addComment(commentJson.user, commentJson.comment.created_at, commentJson.comment.content, false);
        }
        if (nextIndex < commentsCount) {
            createElement("a", element, { text:`older comments (${limit}/${commentsCount})`, before: highestItem, onclick:e => {
                if (isFriend) {
                    e.target.remove(); loadNextComments();
                } else {
                    alert("can't load more because it's not a friend :(");
                }
            } });
        }
    }
    await loadNextComments();
}
