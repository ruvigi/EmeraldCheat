async function openSearch(panel) {
    let term = query("query");
    createElement("a", panel, {className:"heading", text:`search`, href:"/cheat/people"});
    let form = createElement("form", panel, {className:"fill-width"});
    let queryInput = createElement("input", form, {className:"fill-width"});
    queryInput.value = term;
    form.addEventListener("submit", () => internalReplaceState(queryInput.value === "" ? "/cheat/people/search" : `/cheat/people/search?query=${encodeURIComponent(queryInput.value.startsWith("#") ? queryInput.value.substring(1) : queryInput.value)}`));
    if (!term || term === "") {
        return () => queryInput.focus();
    }
    let users = await loadJSON(`/main_search_json?search=${encodeURIComponent(term.trim())}`);
    if (users.length === 0) {
        createElement("span", panel, {text:"no results"});
        return () => queryInput.focus();
    }
    let container = createElement("div", panel, { className: "flex-column" });
    for (let user of users) {
        let userRow = createElement("a", container, {className:"flex-row center-items", href:`/cheat/people/user?id=${user.id}`});
        createElement("img", userRow, {className:"image flex-grow-0", style:"width: 3rem; height: 3rem;", src:userThumbnail(user)});
        createElement("span", userRow, {text:user.display_name});
    }

    return () => queryInput.focus();
}