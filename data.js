let database;

const timeUnits = [
    ["y", 31557600],
    ["mo", 2630016],
    ["w", 604800],
    ["d", 86400],
    ["h", 3600],
    ["min", 60],
    ["s", 1]
];

function getStorageJSON(key) {
    let value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function setStorageJSON(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("EmeraldCheat", 4);
        request.onupgradeneeded = event => {
            let db = event.target.result;
            for (let storeName of ["PictureDates", "KnownUsers"]) {
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

function arraysEqual(array1, array2) {
    if (array1.length !== array2.length) return false;

    for (var i = 0; i < array1.length; ++i)
        if (array1[i] !== array2[i])
            return false;

    return true;
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
        interest.split(" ").includes(p) ||
        interest === p.split("").join(" ") ||
        interest === p.replace(" ", "") ||
        interest === p
    );
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
    return timeString(diff);
}

function timeString(diff) {
    for (let [text, seconds] of timeUnits) {
        let value = Math.floor(diff / seconds);
        if (value >= 1) {
            return `${value}${text} ago`;
        }
    }

    return "now";
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

async function collectUser(user, context) {
    if (!context) {
        alert("context not set :(");
        return;
    }
    let entry = await getDatabaseJSON("KnownUsers", user.id);
    let changed = false;
    if (!entry) {
        entry = {
            key: user.id,
            firstSeen: {
                context,
                timestamp: new Date().toISOString()
            },
            names: [],
            temp: user.temp || (new Date(user.last_logged_in_at) - new Date(user.created_at) < 259200000 && !(user.gold || user.platinum))
        };
        changed = true;
    }
    if (user.gender && user.gender !== entry.gender) {
        entry.gender = user.gender;
        changed = true;
    }
    if (user.location && user.location !== entry.location) {
        entry.location = user.location;
        changed = true;
    }
    if (user.language && user.language !== entry.language) {
        entry.language = user.language;
        changed = true;
    }
    if (user.display_name && !entry.names.includes(user.display_name)) {
        entry.names.push(user.display_name);
        changed = true;
    }
    if (user.interests && (!entry.interests || !arraysEqual(user.interests.map(i => i.name), entry.interests))) {
        entry.interests = user.interests.map(i => i.name);
        changed = true;
    }
    if (changed) {
        await setDatabaseJSON("KnownUsers", entry);
        console.log("collected user " + entry.key);
    }
    return entry;
}
