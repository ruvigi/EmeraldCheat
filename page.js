//information about the main panel and the user panel
let panelData;

let msgsButton;
let notiButton;

//keydown event
let onKeyDown = undefined;

//initial HTML code for the page
const source = `
    <!-- filmer layout.html -->
`;

const loader = "<div class=\"loader\"><div class=\"loader-bar\"></div></div>";
const errorImage = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%0A%3C!--%20Created%20with%20Inkscape%20(http%3A%2F%2Fwww.inkscape.org%2F)%20--%3E%0A%0A%3Csvg%0A%20%20%20width%3D%22120%22%0A%20%20%20height%3D%22120%22%0A%20%20%20viewBox%3D%220%200%20120%20120%22%0A%20%20%20version%3D%221.1%22%0A%20%20%20id%3D%22svg1%22%0A%20%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cdefs%0A%20%20%20%20%20id%3D%22defs1%22%20%2F%3E%0A%20%20%3Cg%0A%20%20%20%20%20id%3D%22layer1%22%3E%0A%20%20%20%20%3Crect%0A%20%20%20%20%20%20%20style%3D%22fill%3A%23412525%3Bstroke-width%3A1.14723%3Bfill-opacity%3A1%22%0A%20%20%20%20%20%20%20id%3D%22rect1%22%0A%20%20%20%20%20%20%20width%3D%22120%22%0A%20%20%20%20%20%20%20height%3D%22120%22%0A%20%20%20%20%20%20%20x%3D%220%22%0A%20%20%20%20%20%20%20y%3D%220%22%20%2F%3E%0A%20%20%20%20%3Cpath%0A%20%20%20%20%20%20%20d%3D%22M%2069.326302%2C72.158125%20H%2054.970462%20L%2051.979662%2C14.4955%20h%2020.33744%20z%20M%2051.740398%2C91.53851%20q%200%2C-5.503072%202.9908%2C-7.77608%203.110432%2C-2.273008%207.417184%2C-2.273008%204.18712%2C0%207.17792%2C2.273008%203.110432%2C2.273008%203.110432%2C7.77608%200%2C5.263808%20-3.110432%2C7.656448%20-2.9908%2C2.273012%20-7.17792%2C2.273012%20-4.306752%2C0%20-7.417184%2C-2.273012%20-2.9908%2C-2.39264%20-2.9908%2C-7.656448%20z%22%0A%20%20%20%20%20%20%20id%3D%22text1%22%0A%20%20%20%20%20%20%20style%3D%22font-weight%3Abold%3Bfont-size%3A119.632px%3Bfont-family%3A'Noto%20Sans'%3B-inkscape-font-specification%3A'Noto%20Sans%2C%20Bold'%3Bfill%3A%23cacaca%3Bstroke-width%3A0.897217%22%0A%20%20%20%20%20%20%20transform%3D%22scale(0.96636096%2C1.03481)%22%0A%20%20%20%20%20%20%20aria-label%3D%22!%22%20%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A";
const blankImage = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%0A%3C!--%20Created%20with%20Inkscape%20(http%3A%2F%2Fwww.inkscape.org%2F)%20--%3E%0A%0A%3Csvg%0A%20%20%20width%3D%22120%22%0A%20%20%20height%3D%22120%22%0A%20%20%20viewBox%3D%220%200%20120%20120%22%0A%20%20%20version%3D%221.1%22%0A%20%20%20id%3D%22svg1%22%0A%20%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cdefs%0A%20%20%20%20%20id%3D%22defs1%22%20%2F%3E%0A%20%20%3Cg%0A%20%20%20%20%20id%3D%22layer1%22%3E%0A%20%20%20%20%3Crect%0A%20%20%20%20%20%20%20style%3D%22fill%3A%23333333%3Bstroke-width%3A1.14723%22%0A%20%20%20%20%20%20%20id%3D%22rect1%22%0A%20%20%20%20%20%20%20width%3D%22120%22%0A%20%20%20%20%20%20%20height%3D%22120%22%0A%20%20%20%20%20%20%20x%3D%220%22%0A%20%20%20%20%20%20%20y%3D%220%22%20%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A";

function focusPanel(index) {
    for (let i = 0; i < panelData.length; i++) {
        panelData[i].wrapper.className = i === index ? "wrapper focus" : "wrapper";
        panelData[i].button.className = "mobile button focus-button" +  (i === index ? "" : " text-inactive");
    }
}

function createElement(type, parent, {className, style, onclick, href, text, src, srcFull, prepend, after}) {
    let element = document.createElement(type);
    if (className)
        element.className = className;
    if (style)
        element.style = style;
    if (onclick)
        element.addEventListener("click", onclick);
    if (href)
        element.href = href;
    if (text)
        element.innerText = text;
    if (src) {
        if (srcFull) {
            element.setAttribute("data-src-full", srcFull);
        }
        element.src = blankImage;
        preloadImage(src, element);
    }
    if (after) {
        after.after(element);
    } else if (parent) {
        if (prepend) {
            parent.prepend(element);
        } else {
            parent.append(element);
        }
    }
    return element;
}

function internalPushState(url) {
    window.history.pushState({}, "", url);
    render();
}

function internalReplaceState(url) {
    window.history.replaceState({}, "", url);
    render();
}

function internalReloadMain() {
    resetUserPanel();
    internalReplaceState(panelData[0].url);
}

function callOnKeyDown(e) {
    if (onKeyDown && !document.activeElement.matches('input'))
        onKeyDown(e);
}

function createPanel(index) {
    if (panelData[index].panel.innerHTML !== loader) {
        let loaderPanel = createElement("div", null, {className:"panel"});
        setLoading(loaderPanel);
        panelData[index].panel = loaderPanel;
        panelData[index].wrapper.innerHTML = "";
        panelData[index].wrapper.append(loaderPanel);
    }
    return createElement("div", null, {className:"panel"});
}

function commitPanel(index, panel) {
    if (panel.innerHTML === "") {
        panel.innerText = "<3";
    }
    if (panelData[index].panel.innerHTML !== loader || panel.innerHTML !== loader) {
        panelData[index].panel = panel;
        panelData[index].wrapper.innerHTML = "";
        panelData[index].wrapper.append(panel);
    }
}

function setLoading(panel) {
    panel.innerHTML = loader;
}

function resetUserPanel() {
    panelData[1].url = panelData[0].url;
    panelData[1].time = panelData[0].time;
    panelData[1].panel = panelData[0].otherPanel;
    panelData[1].wrapper.innerHTML = "";
    panelData[1].wrapper.append(panelData[0].otherPanel);
}

async function loadPage(usesMainPanel, usesUserPanel, func) {
    let time = new Date().valueOf();
    let url = location.href;

    if (usesMainPanel && usesUserPanel && panelData[0].url === url && panelData[1].url !== url && panelData[0].otherPanel) {
        resetUserPanel();
        focusPanel(0);
        return;
    }

    //create empty panels
    let mainPanel, userPanel;
    if (usesMainPanel) {
        onKeyDown = undefined;
        mainPanel = createPanel(0);
        panelData[0].url = null;
        panelData[0].time = time;
    }
    if (usesUserPanel) {
        userPanel = createPanel(1);
        panelData[1].url = null;
        panelData[1].time = time;
    }

    //call the function
    let result;
    if (usesMainPanel) {
        if (usesUserPanel) {
            result = await func(mainPanel, userPanel);
        } else {
            result = await func(mainPanel);
        }
    } else {
        result = await func(userPanel);
    }

    //prevent outdated commits
    if ((!usesMainPanel || panelData[0].time === time) && (!usesUserPanel || panelData[1].time === time)) {
        //commit panels
        if (usesMainPanel) {
            commitPanel(0, mainPanel);
            panelData[0].url = url;
            panelData[0].otherPanel = usesUserPanel ? userPanel : null;
        }
        if (usesUserPanel) {
            commitPanel(1, userPanel);
            panelData[1].url = url;
        }

        focusPanel(usesMainPanel ? 0 : 1);

        if (result) {
            result();
        }
    } else {
        //reset panels if they are loading
        if (usesMainPanel && panelData[0].time === time) {
            commitPanel(0, createPanel(0));
            panelData[0].url = null;
        }
        if (usesUserPanel && panelData[1].time === time) {
            commitPanel(1, createPanel(1));
            panelData[1].url = null;
        }
    }
}

function replaceImageWithPlaceholder(element) {
    let parent = element.parentElement;
    if (parent) {
        parent.replaceChild(createElement("div", null, {className: `${element.getAttribute("class").split(" ").filter(c => c !== "invisible").join(" ")}`, style: element.getAttribute("style"), text: ":("}), element);
    }
}