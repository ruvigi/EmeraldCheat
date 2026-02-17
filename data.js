let database;

function getStorageJSON(key) {
    let value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function setStorageJSON(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("EmeraldCheat", 3);
        request.onupgradeneeded = event => {
            let db = event.target.result;
            for (let storeName of ["PictureDates"]) {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: "key" });
                }
            }
        };
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        request.onerror = event => reject(event.target.error);
    });
}

function getDatabaseJSON(storeName, key) {
    return new Promise((resolve, reject) => {
        let trans = database.transaction(storeName, "readonly");
        let store = trans.objectStore(storeName);
        let request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function setDatabaseJSON(storeName, obj) {
    let trans = database.transaction(storeName, "readwrite");
    let store = trans.objectStore(storeName);
    store.put(obj);
    return trans.complete;
}

function deleteDatabaseJSON(storeName, key) {
    let trans = database.transaction(storeName, "readwrite");
    let store = trans.objectStore(storeName);
    store.delete(key);
    return trans.complete;
}

function getAllDatabaseJSON(storeName) {
    return new Promise((resolve, reject) => {
        let trans = database.transaction(storeName, "readonly");
        let store = trans.objectStore(storeName);
        let request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function clearDatabaseStore(storeName) {
    return new Promise((resolve, reject) => {
        let trans = database.transaction(storeName, "readwrite");
        let store = trans.objectStore(storeName);
        let request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

function filterDatabaseObjects(storeName, condition) {
    return new Promise((resolve, reject) => {
        let trans = database.transaction(storeName, "readonly");
        let store = trans.objectStore(storeName);
        let request = store.openCursor();
        let result = [];
        request.onsuccess = (event) => {
            let cursor = event.target.result;
            if (cursor) {
                if (condition(cursor.value)) {
                    result.push(cursor.value);
                }
                cursor.continue();
            } else {
                resolve(result);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

function countDatabaseObjects(storeName, condition) {
    return new Promise((resolve, reject) => {
        let trans = database.transaction(storeName, "readonly");
        let store = trans.objectStore(storeName);
        let request = store.openCursor();
        let count = 0;
        request.onsuccess = (event) => {
            let cursor = event.target.result;
            if (cursor) {
                if (condition(cursor.value)) {
                    count++;
                }
                cursor.continue();
            } else {
                resolve(count);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

function shuffleArray(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

function countArray(array, condition) {
    let count = 0;
    for (let item of array) {
        if (condition(item)) {
            count++;
        }
    }

    return count;
}

function mergeAndShuffle(items1, items2) {
    let map = new Map();
    for (let item of [...items1, ...items2]) {
        map.set(JSON.stringify(item), item);
    }

    let items = Array.from(map.values());
    shuffleArray(items);
    return items;
}

function interestMatchesWords(interest, words) {
    return words.some(p =>
        interest.name.split(" ").includes(p) ||
        interest.name === p.split("").join(" ") ||
        interest.name === p.replace(" ", "") ||
        interest.name === p
    );
}

function anyInterestMatchesWords(user, words) {
    return user.interests.some(interest => interestMatchesWords(interest, words));
}

function roleName(user) {
    return user.master ? "master" : user.mod ? "mod" : user.platinum ? "platinum" : user.gold ? "gold" : !user.temp ? "registered" : "temp";
}

function before(string, character) {
    let index = string.indexOf(character);
    return index === -1 ? string : string.substring(0, index);
}

function timeSince(date) {
    let diff = Math.floor((new Date() - new Date(date)) / 1000);

    if (new Date(date).valueOf() === 0) return "long ago";

    if (diff === 0) return "now";
    return timeString(diff) + " ago";
}

function timeString(diff) {
    if (diff < 60) return `${diff}s`;

    diff = Math.floor(diff / 60);
    if (diff < 60) return `${diff}min`;

    diff = Math.floor(diff / 60);
    if (diff < 24) return `${diff}h`;

    diff = Math.floor(diff / 24);
    if (diff < 7) return `${diff}d`;
    if (diff < 30) return `${Math.floor(diff / 7)}w`;

    diff = Math.floor(diff / 30);
    if (diff < 12) return `${diff}mo`;

    diff = Math.floor(diff / 12);
    return `${diff}y`;
}

function translateGender(genderId) {
    switch(genderId) {
        case "f": return "female";
        case "m": return "male";
        case "o": return "other";
        default: return "unknown";
    }
}

function translateGenderToPrefix(genderId) {
    switch(genderId) {
        case "f": return "her";
        case "m": return "him";
        case "o": return "them";
        default: return "huh";
    }
}

function userThumbnail(user) {
    return user.thumbnail_picture ?? user.display_picture;
}

function userPicture(user) {
    return user.display_picture ?? user.thumbnail_picture;
}

function tryGetImageUrl(line) {
    try {
        return decodeURIComponent(line).split(" ").find(word => word.startsWith("i.imgur.com/") && !word.includes("@"));
    } catch {
        return null;
    }
}