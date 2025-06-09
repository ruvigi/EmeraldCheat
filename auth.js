//the currently logged in user
let currentUser;

async function loadCurrentUser() {
    if (currentUser) return;
    try {
        let response = await fetch("/current_user_json");
        if (response.status === 200 && response.headers.get("content-type") && response.headers.get("content-type").includes("application/json")) {
            currentUser = await response.json();
        } else {
            window.location.assign("https://emeraldchat.com/");
        }
    } catch {
        alert("failed to load the current user :(");
    }
}