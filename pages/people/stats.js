async function openStats(panel) {
    createElement("a", panel, {className:"heading", text:`stats`, href:"/cheat/people"});
    let stats = await countKnownUsers();

    let generalPanel = createElement("div", panel, {className:"facts gap-0 center-items"});
    createElement("span", generalPanel, {text:`total: ${stats.total}`});

    createElement("span", panel, {className:"text-highlighted", text:"interests"});
    let interestPanel = createElement("div", panel, {className:"facts gap-0 center-items"});
    interestCountRow(interestPanel, stats, "illegal");
    interestCountRow(interestPanel, stats, "sus");
    interestCountRow(interestPanel, stats, "sexual");
    interestCountRow(interestPanel, stats, "normal");
    createElement("span", interestPanel, {text:`none: ${stats.interests.none}`});
    createElement("span", interestPanel, {text:`unknown: ${stats.interests.unknown}`});

    createElement("span", panel, {className:"text-highlighted", text:"locations"});
    let locationPanel = createElement("div", panel, {className:"facts gap-0 center-items"});
    for (let [location, count] of [...stats.locations.map.entries()].sort(([l1, c1], [l2, c2]) => c2 - c1))
        createElement("span", locationPanel, {text:`${location.toLowerCase()}: ${ratio(count, stats.total)}`});
    createElement("span", locationPanel, {text:`unknown: ${stats.locations.unknown}`});

    createElement("span", panel, {className:"text-highlighted", text:"languages"});
    let languagePanel = createElement("div", panel, {className:"facts gap-0 center-items"});
    for (let [language, count] of [...stats.languages.map.entries()].sort(([l1, c1], [l2, c2]) => c2 - c1))
        createElement("span", languagePanel, {text:`${language.split(';')[0].split(',')[0].toLowerCase()}: ${ratio(count, stats.total)}`});
    createElement("span", languagePanel, {text:`unknown: ${stats.locations.unknown}`});
}

function interestCountRow(interestPanel, stats, key) {
    let current = stats.interests[key];
    let total = stats.interests.illegal + stats.interests.sus + stats.interests.sexual + stats.interests.normal;
    createElement("span", interestPanel, {text:`${key}: ${ratio(current, total)}`});
}

function ratio(current, total) {
    return `${current} / ${Math.round(current / total * 1000) / 10}%`;
}

function countKnownUsers() {
    return new Promise((resolve, reject) => {
        let trans = database.transaction("KnownUsers", "readonly");
        let store = trans.objectStore("KnownUsers");
        let request = store.openCursor();
        let stats = {
            interests: {
                illegal: 0,
                sus: 0,
                sexual: 0,
                normal: 0,
                none: 0,
                unknown: 0
            },
            locations: {
                map: new Map(),
                unknown: 0
            },
            languages: {
                map: new Map(),
                unknown: 0
            },
            total: 0
        };
        request.onsuccess = (event) => {
            let cursor = event.target.result;
            if (cursor) {
                stats.total++;
                let user = cursor.value;

                let interests = user.interests;
                if (!interests)
                    stats.interests.unknown++;
                else if (interests.length === 0)
                    stats.interests.none++;
                else if (anyInterestsMatch(interests, illegalWords))
                    stats.interests.illegal++;
                else if (anyInterestsMatch(interests, susWords))
                    stats.interests.sus++;
                else if (anyInterestsMatch(interests, sexualWords))
                    stats.interests.sexual++;
                else stats.interests.normal++;

                if (user.location)
                    stats.locations.map.set(user.location, (stats.locations.map.get(user.location) || 0) + 1);
                else stats.locations.unknown++;

                if (user.language)
                    stats.languages.map.set(user.language, (stats.languages.map.get(user.language) || 0) + 1);
                else stats.languages.unknown++;
                
                cursor.continue();
            } else {
                resolve(stats);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

function anyInterestsMatch(interests, words) {
    for (let interest of interests)
        if (interestMatchesWords(interest, words))
            return true;
    return false;
}