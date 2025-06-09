const ban7s = { name:"7s", value:"7" };
const ban2min = { name:"2min", value:"120" };
const ban5min = { name:"5min", value:"300" };
const ban10min = { name:"10min", value:"600" };
const ban15min = { name:"15min", value:"900" };
const ban30min = { name:"30min", value:"1800" };
const ban1h = { name:"1h", value:"3600" };
const ban3h = { name:"3h", value:"10800" };
const ban6h = { name:"6h", value:"21600" };
const ban12h = { name:"12h", value:"43200" };
const ban1d = { name:"1d", value:"86400" };
const ban3d = { name:"3d", value:"259200" };
const ban2w = { name:"2w", value:"1209600" };
const ban1y = { name:"1y", value:"31556952" };
const ban10y = { name:"10y", value:"315569520" };

const banSpam = { name:"spam", value:"Multiple spam attempts in chat" };
const banHarassment = { name:"harassment", value:"Harassment, threats and/or abuse towards a user or group of users" };
const banSexual = { name:"sexual", value:"Sexually explicit remarks towards a user or group of users" };
const banRacist = { name:"racist etc.", value:"Spreading derogatory words/racism/bigotry in chat" };
const banCSA = { name:"child abuse", value:"Distribution/Promotion of illegal content involving CP/CSA" };
const banEnglish = { name:"not english", value:"Please keep group chat in English" };
const banExternal = { name:"external media", value:"Promotion of external social media" };
const banIllegal = { name:"illegal", value:"Distribution/Promotion of illegal/explicit content" };
const banUnderage = { name:"underage", value:"Feel free to join our Group Chat, but you must be 18+ in order to use 1-on-1 Text Chat/Video Chat" };
const banNudeVideo = { name:"nude video", value:"Please don't start your video with nudity or sexual content, not everyone wants to see that" };
const banPerm = { name:"under review", value:"Your account is under review for potential illegal actions. Please refer to a mod for an update on your account status" };

const banDurations = [
    ban7s,
    ban2min,
    ban5min,
    ban10min,
    ban15min,
    ban30min,
    ban1h,
    ban3h,
    ban6h,
    ban12h,
    ban1d,
    ban3d,
    ban2w,
    ban1y,
    ban10y
];

const banReasons = [
    banSpam,
    banHarassment,
    banSexual,
    banRacist,
    banCSA,
    banEnglish,
    banExternal,
    banIllegal,
    banUnderage,
    banNudeVideo,
    banPerm
];

async function banUser(userId, duration, reason) {
    await sendActionRequest(`/ban_user?id=${userId}&duration=${duration}&reason=${encodeURIComponent(reason)}`, "GET");
}