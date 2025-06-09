let videoItems;
let videoTimestamp;
let videoLastTuple;

async function openVideos(panel, userPanel) {
    await loadVideos();
    if (videoItems.length === 0) {
        createElement("a", panel, {className:"heading", text: "videos", href:"/cheat/mod"});
        createElement("span", panel, {text:"no videos"});
        let videosReloadElement = createElement("a", panel, {className: "button", text:"reload", onclick:e => {e.target.innerHTML = "loading"; internalReloadMain();}});
        panel.innerHTML = `&lt;3`;
        onKeyDown = e => { if(!e.ctrlKey && e.key === "r") { videosReloadElement.innerHTML = "loading"; internalReloadMain(); }};
    } else {
        setLoading(panel);
        setLoading(userPanel);
        videoLastTuple = videoItems[0];
        return () => internalReplaceState(`/cheat/mod/video?id=${videoLastTuple.id}`);
    }
}

async function openVideo(panel, userPanel) {
    let userId = parseInt(query("id"));
    await loadVideos();
    let videoTuple = videoItems.find(item => item.id === userId);
    if (!videoTuple) {
        if (videoLastTuple && videoLastTuple.id === userId) {
            videoTuple = videoLastTuple;
        } else {
            await loadVideos(true);
            videoTuple = videoItems.find(item => item.id === userId);
            videoLastTuple = videoTuple;
            if (!videoTuple) {
                createElement("a", panel, {className:"heading", text: "videos", href:"/cheat/mod"});
                createElement("span", panel, {text:"video not found :("});
                createElement("a", panel, {className: "button", text:"back", href:"/cheat/mod/videos"});
                onKeyDown = e => { if(!e.ctrlKey && e.key === "q") { internalReplaceState("/cheat/mod/videos"); }};
                focusPanel(0);
                return;
            }
        }
    }
    videoLastTuple = videoTuple;


    let promises = [openUser(userPanel, userId)];
    let dataURLs = [];
    let shotElements = [];
    for (let i = 0; i < videoTuple.video_moderations.length; i++) {
        shotElements.push(null);
        if (!config.doNotPreloadVideos) {
            dataURLs.push(null);
            promises.push(getImageAsDataURL(videoTuple.video_moderations[i].image).then(dataURL => dataURLs[i] = dataURL));
        }
    }
    for (let promise of promises) {
        await promise;
    }

    createElement("a", panel, {className:"heading", text:`video +${videoItems.length - 1}`, href:"/cheat/mod"});
    let indexText = createElement("span", panel, {text:`1/${videoTuple.video_moderations.length}`});
    let shotIndex = -1;
    let videoControlContainer = createElement("div", panel, {className: "flex-row", style: "gap: 1rem;"});
    let paused = false;
    createElement("a", videoControlContainer, { className: "button", text: "prev", onclick: () => prevShot() });
    createElement("a", videoControlContainer, { className: "button", text: "pause", onclick: e => { paused = !paused; e.target.innerHTML = paused ? "play" : "pause"; } });
    createElement("a", videoControlContainer, { className: "button", text: "next", onclick: () => nextShot() });
    let shotContainer = createElement("div", panel, {className: "flex-column block-grow flex-grow-1", style: "width: 100%; overflow: hidden; position: relative;"});
    createElement("div", shotContainer, { className: "hidden-when-fullscreen", style: `width: 100%; height: 100%; position: absolute; z-index: ${1000 + videoTuple.video_moderations.length};`, onclick: () => shotElements[(shotIndex + videoTuple.video_moderations.length) % videoTuple.video_moderations.length].click() });
    let switchInterval;
    let loaded = null;

    function prevShot() {
        shotIndex = (shotIndex - 1 + shotElements.length) % shotElements.length;
        indexText.innerText = `${shotIndex+1}/${shotElements.length}`;
        for (let i = shotElements.length; i > 0; i--) {
            let element = shotElements[(shotIndex + i) % shotElements.length];
            if (element) {
                element.style.zIndex = 999 + i;
            }
        }
        if (!shotElements[shotIndex]) {
            let imgElement = createElement("img", shotContainer, {style:`width: 100%; height: 100%; position: absolute; z-index: ${999 + shotElements.length}`, className:"image block-grow invisible"});
            shotElements[shotIndex] = imgElement;
            let imageSrc = config.doNotPreloadVideos ? videoTuple.video_moderations[shotIndex].image : dataURLs[shotIndex];
            if (imageSrc) {
                imgElement.addEventListener("load", () => {
                    imgElement.classList.remove("invisible");
                });
                imgElement.src = imageSrc;
            }
        }
        if (shotElements[(shotIndex + 1) % shotElements.length]) {
            shotElements[(shotIndex + 1) % shotElements.length].style.zIndex = 1000;
        }
    }

    function nextShot() {
        shotIndex = (shotIndex + 1) % shotElements.length;
        indexText.innerText = `${shotIndex+1}/${shotElements.length}`;
        for (let i = 0; i < shotElements.length; i++) {
            let element = shotElements[(shotIndex + i) % shotElements.length];
            if (element) {
                element.style.zIndex = 999 + i;
            }
        }
        if (shotElements[shotIndex]) {
            shotElements[shotIndex].style.zIndex = 999 + shotElements.length;
        } else {
            let imgElement = createElement("img", shotContainer, {style:`width: 100%; height: 100%; position: absolute; z-index: ${999 + shotElements.length}`, className:"image block-grow invisible"});
            shotElements[shotIndex] = imgElement;
            let imageSrc = config.doNotPreloadVideos ? videoTuple.video_moderations[shotIndex].image : dataURLs[shotIndex];
            if (imageSrc) {
                imgElement.addEventListener("load", () => {
                    imgElement.classList.remove("invisible");
                });
                imgElement.src = imageSrc;
            }
        }
    }

    function changeShot() {
        if (loaded && (!shotContainer || !shotContainer.isConnected)) {
            clearInterval(switchInterval);
            return;
        }
        if (loaded === false) {
            loaded = true;
        }
        if (paused) {
            return;
        }
        nextShot();
    }

    nextShot();
    switchInterval = setInterval(changeShot, 400);

    let buttonContainer = createElement("div", panel, {className:"flex-row", style:"gap: 1rem"});
    let readButton = createElement("a", buttonContainer, {className: "button", text:"mark as read", onclick:async e => await markVideoAsRead(videoTuple, e.target) });
    createElement("a", buttonContainer, {className: "button", text:"ban for nude", onclick:async e => await banForNude(videoTuple, e.target) });
    onKeyDown = async e => {
        if (e.ctrlKey) return;
        switch (e.key) {
            case "m":
            case "r":
                e.preventDefault();
                await markVideoAsRead(videoTuple, readButton);
                break;
            case "f":
                e.preventDefault();
                let shotElement = shotElements.find(e => e.classList.contains("fullscreen"));
                if (shotElement) {
                    shotElement.click();
                } else {
                    shotElements[(shotIndex - 1 + videoTuple.video_moderations.length) % videoTuple.video_moderations.length].click();
                }
                break;
        }
    };
    loaded = false;
}

async function loadVideos(forceReload) {
    if (!forceReload && videoItems && videoTimestamp && (new Date() - videoTimestamp) < 15000)
        return;

    let promise1 = loadJSON(`/video_moderations?sort=most_recent&page=1`, true);
    let promise2 = loadJSON(`/video_moderations?sort=max_count&page=1`, true);
    let items1 = await promise1;
    let items2 = await promise2;
    if (items1 && items2) {
        let items = [...new Set([...items1, ...items2])];
        shuffleArray(items);
        videoItems = items;
        videoTimestamp = new Date();
    }
}

async function markVideoAsRead(videoTuple, buttonElement) {
    videoItems.shift(); //remove first item so the videos keep working without a reload
    buttonElement.innerHTML = "reading...";
    await sendActionRequest(`/video_moderations/${videoTuple.id}`, "DELETE", true);
    internalReplaceState("/cheat/mod/videos");
}

async function banForNude(videoTuple, buttonElement) {
    buttonElement.innerHTML = "banning...";
    await banUser(videoTuple.id, ban15min.value, banNudeVideo.value);
    videoItems.shift(); //remove first item so the videos keep working without a reload
    await sendActionRequest(`/video_moderations/${videoTuple.id}`, "DELETE", true);
    internalReplaceState("/cheat/mod/videos");
}