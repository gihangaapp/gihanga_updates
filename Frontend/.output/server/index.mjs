globalThis.__nitro_main__ = import.meta.url;
import { i as serve, r as NodeResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
import { a as toEventHandler, i as defineLazyEventHandler, n as HTTPError, r as defineHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/apple-touch-icon.png": {
		"type": "image/png",
		"etag": "\"b627-S4S5es5dVdfwsWlIk0/XMDfkRxI\"",
		"mtime": "2026-10-29T10:46:27.195Z",
		"size": 46631,
		"path": "../public/apple-touch-icon.png"
	},
	"/favicon-96x96.png": {
		"type": "image/png",
		"etag": "\"3f11-1S3FKqkD+0Bj/7AI97EnMoTaiRE\"",
		"mtime": "2026-10-29T10:46:27.193Z",
		"size": 16145,
		"path": "../public/favicon-96x96.png"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ae-hLVBrSrDdpIw3Xl0dJPRkupPepQ\"",
		"mtime": "2026-10-29T10:46:27.195Z",
		"size": 174,
		"path": "../public/robots.txt"
	},
	"/site.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"1cf-EKPn24rb01utiCI0tfC0FTBH0VQ\"",
		"mtime": "2026-10-29T10:46:27.193Z",
		"size": 463,
		"path": "../public/site.webmanifest"
	},
	"/web-app-manifest-192x192.png": {
		"type": "image/png",
		"etag": "\"cc31-NZ/5ibBtEBotZXdhJVaT9i2VSag\"",
		"mtime": "2026-10-29T10:46:27.195Z",
		"size": 52273,
		"path": "../public/web-app-manifest-192x192.png"
	},
	"/web-app-manifest-512x512.png": {
		"type": "image/png",
		"etag": "\"4af5c-tHFQROc/STVuhgHautyMaL1jY1I\"",
		"mtime": "2026-10-29T10:46:27.197Z",
		"size": 307036,
		"path": "../public/web-app-manifest-512x512.png"
	},
	"/assets/AdBadge-DsWk0ThX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"250-m+OxRUXqiEGRQLjl6iJ3NKBuwcA\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 592,
		"path": "../public/assets/AdBadge-DsWk0ThX.js"
	},
	"/assets/AdPreview-CfVt2K8T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ba-wcPnMezXqhk1KcBp+aRR7UNhQsI\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 4282,
		"path": "../public/assets/AdPreview-CfVt2K8T.js"
	},
	"/assets/AdminCharts-CtdFyrs-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4835-IAYCMexh9WfyHE4pv/yfBZjVF90\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 18485,
		"path": "../public/assets/AdminCharts-CtdFyrs-.js"
	},
	"/assets/AdminUI-9S8MXTj_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2342-ezJAVduAIkM45Q95SIi2hDFHMrQ\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 9026,
		"path": "../public/assets/AdminUI-9S8MXTj_.js"
	},
	"/assets/AuthFields-jQyibYK7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a70-c4ERuZRwcGNZ30dEuWYXk2+kWys\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 2672,
		"path": "../public/assets/AuthFields-jQyibYK7.js"
	},
	"/assets/AuthLayout-Chv72ZUw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7f9-CUofrhJJv0eyYT4TszvMFy35wG0\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 2041,
		"path": "../public/assets/AuthLayout-Chv72ZUw.js"
	},
	"/assets/CommentSheet-BHiEk-A-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2905-66/bgSrhDa63oljy6zQPjCphFvU\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 10501,
		"path": "../public/assets/CommentSheet-BHiEk-A-.js"
	},
	"/assets/Match-CbWYEcAb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1188-nRkfcTS82AsqYex4Jo2T213IEws\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 4488,
		"path": "../public/assets/Match-CbWYEcAb.js"
	},
	"/assets/PostCard-Dbpln79D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"609d-tY/39T6RvdyqHyuqH+FeVadDsp0\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 24733,
		"path": "../public/assets/PostCard-Dbpln79D.js"
	},
	"/assets/PostSkeleton-Brlp1WwI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b0-xagwR9B+gEeQWF7akSD2dYRpQYg\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 944,
		"path": "../public/assets/PostSkeleton-Brlp1WwI.js"
	},
	"/assets/SocialButtons-B2vVVo-g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6f8-N9KGn447ljD0VBMWeXJToA8S0os\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 1784,
		"path": "../public/assets/SocialButtons-B2vVVo-g.js"
	},
	"/assets/activity-9j73hdO7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"df-k6Hipg5GS3psEozJASmJaKi2Zq4\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 223,
		"path": "../public/assets/activity-9j73hdO7.js"
	},
	"/assets/ads-CjgiAp6Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8078-57CJ8F6lVFaEiu5Z6HR9sfo4se4\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 32888,
		"path": "../public/assets/ads-CjgiAp6Q.js"
	},
	"/assets/api-client-CBcThq3a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112b-EODdNzcAuRUx830hfYVnBAUhSj0\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 4395,
		"path": "../public/assets/api-client-CBcThq3a.js"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"3aee-Achds14k8G0bVzfW0qbWM6yMPLk\"",
		"mtime": "2026-10-29T10:46:27.184Z",
		"size": 15086,
		"path": "../public/favicon.ico"
	},
	"/assets/_-CrAKnUwc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"494-jxDsxN4XM7SGjq5YM9Xs0UybM2M\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 1172,
		"path": "../public/assets/_-CrAKnUwc.js"
	},
	"/assets/AreaChart-BExNjMDP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6301c-Gny3bX0tO8g3Fn9Tn2iVmtl8Dv8\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 405532,
		"path": "../public/assets/AreaChart-BExNjMDP.js"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"1bcd3b-YNxEwdVItKEaK3cYNNT22I5W2Bk\"",
		"mtime": "2026-10-29T10:46:27.216Z",
		"size": 1822011,
		"path": "../public/favicon.svg"
	},
	"/assets/auth-context-DAqHME2e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b9fa-CwgYiGT+TGJnymrbhlSPUpS7JCM\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 47610,
		"path": "../public/assets/auth-context-DAqHME2e.js"
	},
	"/assets/award-COHXfLJH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"107-/lSxlccldiIbwHNJgLcOBKvql6A\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 263,
		"path": "../public/assets/award-COHXfLJH.js"
	},
	"/assets/Heropage_image-D9IuWn3m.png": {
		"type": "image/png",
		"etag": "\"1d13b4-8MRP3LgT1Ap5mUUCmTGdWlhDYbk\"",
		"mtime": "2026-10-29T10:46:24.166Z",
		"size": 1905588,
		"path": "../public/assets/Heropage_image-D9IuWn3m.png"
	},
	"/assets/badge-check-B9COg4ah.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"131-YPOi7OHFFTGwrzHpYawnQTNtL7s\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 305,
		"path": "../public/assets/badge-check-B9COg4ah.js"
	},
	"/assets/bookmarks-jFMM-fJ8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"101b-5nVe9R3r9q2PKPZtGXFzpWFXVnI\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 4123,
		"path": "../public/assets/bookmarks-jFMM-fJ8.js"
	},
	"/assets/browser-live-B7WM-426.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3ce9-GFsjHIKoTpKYsqqr1ZIk872lQ5o\"",
		"mtime": "2026-10-29T10:46:24.155Z",
		"size": 15593,
		"path": "../public/assets/browser-live-B7WM-426.js"
	},
	"/assets/button-CdP1eYlC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1364-sJ9KFc/Riy95dqxBYB/g5mVfSXg\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 4964,
		"path": "../public/assets/button-CdP1eYlC.js"
	},
	"/assets/check-DyOnOI9f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-UzKrlv1/1k3Nb1v/V+UvHf3jnZk\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 113,
		"path": "../public/assets/check-DyOnOI9f.js"
	},
	"/assets/circle-Sqm7SWy8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c4-vcWtoW7z13WQ0Vynm0ColA3hkiA\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 196,
		"path": "../public/assets/circle-Sqm7SWy8.js"
	},
	"/assets/coins-BcuXYD7P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112-QvDzcTdS5s2Db7XtEdHLRrv13HQ\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 274,
		"path": "../public/assets/coins-BcuXYD7P.js"
	},
	"/assets/dist-BK0p2cZg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135c-AJRZEkqCivjjtWKiPiCy4Cp9phI\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 4956,
		"path": "../public/assets/dist-BK0p2cZg.js"
	},
	"/assets/dist-CSFvncGH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8cb3-y4cCKOi0wGR6miIyniY/rscM430\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 36019,
		"path": "../public/assets/dist-CSFvncGH.js"
	},
	"/assets/dist-DADKrdI4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"279-NHwg6P7DGTIoJnn2YRhDQRqz6MM\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 633,
		"path": "../public/assets/dist-DADKrdI4.js"
	},
	"/assets/dollar-sign-BVBLN1E9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d0-sP3rq8ur8LyFZj3yO40xK7Yj04o\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 208,
		"path": "../public/assets/dollar-sign-BVBLN1E9.js"
	},
	"/assets/ellipsis-vertical-Db1G--rj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e0-3d2YdNNAD8YM13R3+7gqu8l8ES0\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 224,
		"path": "../public/assets/ellipsis-vertical-Db1G--rj.js"
	},
	"/assets/eye-off-D1SJNlZx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a3-EyOwo5LKiQUKOF4Al7LgQNH1/Y0\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 419,
		"path": "../public/assets/eye-off-D1SJNlZx.js"
	},
	"/assets/flag-R_eFGz1J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f3-8JqmCQBieXQV94F7rHh/TmHf1Tk\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 243,
		"path": "../public/assets/flag-R_eFGz1J.js"
	},
	"/assets/forgot-password-Cgt-J9Ng.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"85b-nOKTJA8ctia/O2ME8uo+u9rY0FE\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 2139,
		"path": "../public/assets/forgot-password-Cgt-J9Ng.js"
	},
	"/assets/gift-BQlpueM4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"152-JJOG0nt3S1ZcPllyDUvSAM0HDfs\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 338,
		"path": "../public/assets/gift-BQlpueM4.js"
	},
	"/assets/grid-3x3-BLW3nn7b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11c-zmCabwGfdnCrigP6NHl+HLgf8Es\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 284,
		"path": "../public/assets/grid-3x3-BLW3nn7b.js"
	},
	"/assets/history-BmY3-IGM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-/zWx/Zw/qYsJoyEDfxQqrunLyy0\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 226,
		"path": "../public/assets/history-BmY3-IGM.js"
	},
	"/assets/interests-DFC-qcjW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9d4-eO0NuA2Z4benx7nY6vW1v3TQboA\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 2516,
		"path": "../public/assets/interests-DFC-qcjW.js"
	},
	"/assets/index-CE9ujdq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ba94-f7WCdF9s5F5526fV5de8MhN3Bzc\"",
		"mtime": "2026-10-29T10:46:24.154Z",
		"size": 1096340,
		"path": "../public/assets/index-CE9ujdq7.js"
	},
	"/assets/enable section-BMjT5lF0.png": {
		"type": "image/png",
		"etag": "\"19124a-CBKiIXf2PGFpMBNP4QwF7T9NZSk\"",
		"mtime": "2026-10-29T10:46:24.166Z",
		"size": 1643082,
		"path": "../public/assets/enable section-BMjT5lF0.png"
	},
	"/assets/layers-DN2W9OxT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19a-Z6i6Aio3nCuyghrjG4fjNRGWyfc\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 410,
		"path": "../public/assets/layers-DN2W9OxT.js"
	},
	"/assets/link-DKD2USHS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c24-8eTdvupLiDSpnnzHEyPLw8Hk4yw\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 11300,
		"path": "../public/assets/link-DKD2USHS.js"
	},
	"/assets/live-BZiMjxNF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32d2-eXTH30ZpoDbT2bXvQeBl0ANRG9k\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 13010,
		"path": "../public/assets/live-BZiMjxNF.js"
	},
	"/assets/live._streamId-D2XiCmxX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e798-abV+fByvW33q/yRglCMzimmLtRc\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 59288,
		"path": "../public/assets/live._streamId-D2XiCmxX.js"
	},
	"/assets/lock-DxRqbrv9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c3-K9ABURfGF6VITM8xDKmH5oGzty8\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 195,
		"path": "../public/assets/lock-DxRqbrv9.js"
	},
	"/assets/log-out-DKWXLJ8O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3aa-ehRjDrI1f1C9E38BJg0RWWzwbl0\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 938,
		"path": "../public/assets/log-out-DKWXLJ8O.js"
	},
	"/assets/login-DFUPKS1a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d4d-ptLDww7EwghBbCSGaCE2F1p2DgA\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 3405,
		"path": "../public/assets/login-DFUPKS1a.js"
	},
	"/assets/logo-gPdiPCCF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"31-7IVzke5IEt+gyXAqtL/Os9vvK1g\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 49,
		"path": "../public/assets/logo-gPdiPCCF.js"
	},
	"/assets/mail-CVmL0LXY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-WQhdtfni5i+f4dl/w3EH18T7INw\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 202,
		"path": "../public/assets/mail-CVmL0LXY.js"
	},
	"/assets/notifications-CWIlxwm1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1032-QaBxT8gFKYnm/m64mGw0kkXHkKc\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 4146,
		"path": "../public/assets/notifications-CWIlxwm1.js"
	},
	"/assets/permissions-hXBqCuQJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c6-k2iN/02euBV8QSKNtBTlvN9ZgvM\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 1222,
		"path": "../public/assets/permissions-hXBqCuQJ.js"
	},
	"/assets/post._postId-DfDPyjI4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5b1-m6YAe8QneBQfd3PGreBj4ICb3co\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 1457,
		"path": "../public/assets/post._postId-DfDPyjI4.js"
	},
	"/assets/preload-helper-BsDu6UID.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6fc-YOLZkmnxd8dUc8M5O1ELmXxNJuY\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 1788,
		"path": "../public/assets/preload-helper-BsDu6UID.js"
	},
	"/assets/profile._username-oi2Ho4Lp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"645d-DOch9MkEH5WFD458hFxLs9Atvrs\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 25693,
		"path": "../public/assets/profile._username-oi2Ho4Lp.js"
	},
	"/assets/progress-m8Hlazuu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8a9-S5POm4OX2ih/3fjvSuzP8bkbk0M\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 2217,
		"path": "../public/assets/progress-m8Hlazuu.js"
	},
	"/assets/radio-CKVnhjhi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16b-QVZSBQqSHrk4mCGrzlRz46vpe5g\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 363,
		"path": "../public/assets/radio-CKVnhjhi.js"
	},
	"/assets/react-DognOA9y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d857-BYSGgbE6xnoyIYBSW6Jr1Z6mQpU\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 120919,
		"path": "../public/assets/react-DognOA9y.js"
	},
	"/assets/reels-BV4jz-NP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4895-lrvnjQBBGPlnpXNu0dmj0plJhaM\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 18581,
		"path": "../public/assets/reels-BV4jz-NP.js"
	},
	"/assets/register-BXOer853.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49e2-PryhgMc7XYxrTl0RTcoxYatpjd8\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 18914,
		"path": "../public/assets/register-BXOer853.js"
	},
	"/assets/reset-password-j17khmFT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bca-8hwRoIXtdy2wCqViXtY/Caxro/I\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 3018,
		"path": "../public/assets/reset-password-j17khmFT.js"
	},
	"/assets/live-room-Difk2CxB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81e19-Cf67j+AdIRnERMY0DRC8vasyJqI\"",
		"mtime": "2026-10-29T10:46:24.156Z",
		"size": 531993,
		"path": "../public/assets/live-room-Difk2CxB.js"
	},
	"/assets/root-DLTE-HSj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20-vSYConOtSP6ciwr9zKsPixNwWmc\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 32,
		"path": "../public/assets/root-DLTE-HSj.js"
	},
	"/assets/rotate-ccw-LNLe6R3z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd-uKmWQdi3rSi1MkXawUSDYsVjmNY\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 189,
		"path": "../public/assets/rotate-ccw-LNLe6R3z.js"
	},
	"/assets/logo-DsDyB9Dx.png": {
		"type": "image/png",
		"etag": "\"1a26a2-DvE76b7lVXrUIU7yfr/0bbH0s4o\"",
		"mtime": "2026-10-29T10:46:24.167Z",
		"size": 1713826,
		"path": "../public/assets/logo-DsDyB9Dx.png"
	},
	"/assets/routes-DbnxfJ5A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66d7-3VT1bkTTZKoXaeCyA9EkjatvzJs\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 26327,
		"path": "../public/assets/routes-DbnxfJ5A.js"
	},
	"/assets/save-BP-SvRHm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-mguiIXyUWf5p4wTgdZS8xJbe1G8\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 316,
		"path": "../public/assets/save-BP-SvRHm.js"
	},
	"/assets/settings-ClOQ7uZp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1dc-i2lD+6rxyjwz0jBxZyaNYNlL0c0\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 476,
		"path": "../public/assets/settings-ClOQ7uZp.js"
	},
	"/assets/shield-alert-C0-WS5PI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156-TAMrHsnjbpfYPodq3VfgdElA9jE\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 342,
		"path": "../public/assets/shield-alert-C0-WS5PI.js"
	},
	"/assets/smartphone-DMJRq05N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12d-cOyGrjhOqzUV/1WbguApq4gVXCg\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 301,
		"path": "../public/assets/smartphone-DMJRq05N.js"
	},
	"/assets/studio-fue9VxRV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26d6-zh/URu+Ze5Syowr6CgaZEUtVV60\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 9942,
		"path": "../public/assets/studio-fue9VxRV.js"
	},
	"/assets/styleguide-D9AZ744z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b5b-qtJmqyqtKpG4CUOlpem451jfV38\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 7003,
		"path": "../public/assets/styleguide-D9AZ744z.js"
	},
	"/assets/styles-Df4K-jP2.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"2de22-6EgsFBUSyWY62psK4aNM7Kq/uck\"",
		"mtime": "2026-10-29T10:46:24.168Z",
		"size": 187938,
		"path": "../public/assets/styles-Df4K-jP2.css"
	},
	"/assets/switch-QwHcp1NB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10b9-/hUnlNXeTSqTIIFu0T78plCJeUk\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 4281,
		"path": "../public/assets/switch-QwHcp1NB.js"
	},
	"/assets/system.dashboard-VaZIy1Hx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4155-GNpaHsOxdJ/j3HneKY/Uh9bSfmI\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 16725,
		"path": "../public/assets/system.dashboard-VaZIy1Hx.js"
	},
	"/assets/system.dashboard.accounts-CMw0POww.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2750-L1W/ybC6HT0JVhmE4hNYuQLTB6k\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 10064,
		"path": "../public/assets/system.dashboard.accounts-CMw0POww.js"
	},
	"/assets/system.dashboard.achievements-BBQ9s_aT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f6d-z9RJeqnKDV9UOW+kajXN5QpiXuM\"",
		"mtime": "2026-10-29T10:46:24.164Z",
		"size": 8045,
		"path": "../public/assets/system.dashboard.achievements-BBQ9s_aT.js"
	},
	"/assets/system.dashboard.activity-BEnvVRU4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1152-TG7Hbh3FT0pmFuVaZnszCE/Jh5s\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 4434,
		"path": "../public/assets/system.dashboard.activity-BEnvVRU4.js"
	},
	"/assets/system.dashboard.ad-settings-C2F1-GDl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aeb-ORYhqFPf1BKng/SIM5nCKUoCUnA\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 6891,
		"path": "../public/assets/system.dashboard.ad-settings-C2F1-GDl.js"
	},
	"/assets/system.dashboard.audit-DKXHe-Js.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1174-GqGCp2IbCRHOPEenD11r4NCg3PE\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 4468,
		"path": "../public/assets/system.dashboard.audit-DKXHe-Js.js"
	},
	"/assets/system.dashboard.campaigns-CS4I0zm_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22e7-ptBRf2R3CpxvN+gYQE3fMlfgBJo\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 8935,
		"path": "../public/assets/system.dashboard.campaigns-CS4I0zm_.js"
	},
	"/assets/system.dashboard.growth-pZx0Tuap.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"104b-rTBe81gJc2xgJnwrZWNfJHNwrX8\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 4171,
		"path": "../public/assets/system.dashboard.growth-pZx0Tuap.js"
	},
	"/assets/system.dashboard.index-CxZORMfl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3fc8-tFB15qxjvDjFBV5HDhum4Vlvfo4\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 16328,
		"path": "../public/assets/system.dashboard.index-CxZORMfl.js"
	},
	"/assets/system.dashboard.live-DvkF421-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d74-G8MHHYJPyyO+Zp528syppSxF5co\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 7540,
		"path": "../public/assets/system.dashboard.live-DvkF421-.js"
	},
	"/assets/system.dashboard.moderation-w5ltz7rx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47e4-EpTokiBQvsVDd16jRF+Mf8oR6Aw\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 18404,
		"path": "../public/assets/system.dashboard.moderation-w5ltz7rx.js"
	},
	"/assets/system.dashboard.payments-De5CHJ6O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd3-HjuniiunUkPI3bRwzjxlgWAduX4\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 4051,
		"path": "../public/assets/system.dashboard.payments-De5CHJ6O.js"
	},
	"/assets/system.dashboard.rewards-CYhSUQ4d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ea-IGHrpL47lWmbQbJmxo2fvG074Ac\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 4330,
		"path": "../public/assets/system.dashboard.rewards-CYhSUQ4d.js"
	},
	"/assets/system.dashboard.settings-DODjr9Yn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15f9-cyViJuKBtAx1/oBV6IKdq4gJF2w\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 5625,
		"path": "../public/assets/system.dashboard.settings-DODjr9Yn.js"
	},
	"/assets/system.dashboard.staff-5WY671Ak.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2438-/Z2wpS9yD4wlfNcxIZnZzBIZQZE\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 9272,
		"path": "../public/assets/system.dashboard.staff-5WY671Ak.js"
	},
	"/assets/system.index-D-LA5DFF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"315d-Br4dO+6PJGIu3ggvnvacV6qYIYc\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 12637,
		"path": "../public/assets/system.index-D-LA5DFF.js"
	},
	"/assets/system.register-C5s_x3UK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3a89-7f5g0IbAjYZMowqMoflYxi85dZM\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 14985,
		"path": "../public/assets/system.register-C5s_x3UK.js"
	},
	"/assets/tag._tag-DLCPbpN4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af0-jCUQ4C4TtrJU6BPMxngVREjX3DY\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 2800,
		"path": "../public/assets/tag._tag-DLCPbpN4.js"
	},
	"/assets/target-DHYoczC4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d7-qDPvk5SrlMOa6QkezOGYODht6iA\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 215,
		"path": "../public/assets/target-DHYoczC4.js"
	},
	"/assets/textarea-Dwpj3xSu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"381-8yRV8CZn5f46P30wdSN09bNCrqg\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 897,
		"path": "../public/assets/textarea-Dwpj3xSu.js"
	},
	"/assets/use-ads-BhAUnhPh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f77-QwbhAMPCxxxktwgA568qV1plkto\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 3959,
		"path": "../public/assets/use-ads-BhAUnhPh.js"
	},
	"/assets/use-live-GmFsEK19.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"177c-DucUSaBufqBSXw6TMnIdGNGZNyA\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 6012,
		"path": "../public/assets/use-live-GmFsEK19.js"
	},
	"/assets/use-staff-finance-DJijYxw7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3aa-+16Wu1s3b6c2uhm5R7Lxgh63DJk\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 938,
		"path": "../public/assets/use-staff-finance-DJijYxw7.js"
	},
	"/assets/use-staff-management-CTLkxehK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7d8-GOv4gKVNLfh4+vQeq+8XYPGUKno\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 2008,
		"path": "../public/assets/use-staff-management-CTLkxehK.js"
	},
	"/assets/use-staff-notifications-qriygmJn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b5-WbcjW/7B/3ma9Q8C+5YUQm3bxN0\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 1205,
		"path": "../public/assets/use-staff-notifications-qriygmJn.js"
	},
	"/assets/use-wallet-llSnXzW7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"385-3uOQg4Q02iR7EemkBMiYffj6o7k\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 901,
		"path": "../public/assets/use-wallet-llSnXzW7.js"
	},
	"/assets/useMatch-B2PtVVJm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"245-Bc2w2psa/SVH6jCeFGovlz1mtSE\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 581,
		"path": "../public/assets/useMatch-B2PtVVJm.js"
	},
	"/assets/useMutation-DCuVaurX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15d9-A0ZQtVev0UsUx7zghVRwbScbw0Y\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 5593,
		"path": "../public/assets/useMutation-DCuVaurX.js"
	},
	"/assets/useNavigate-Cgqa89vq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d9-nG9xm4t15mjPt92jxDMEs+Koh3I\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 217,
		"path": "../public/assets/useNavigate-Cgqa89vq.js"
	},
	"/assets/useQuery-CRso1xbz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5c72-5xelBHr01PUL5m0TGQeNQ0aJQgc\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 23666,
		"path": "../public/assets/useQuery-CRso1xbz.js"
	},
	"/assets/users-jXK--NAZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-tXs719PdqYC0E3VYoRkRb8VH9nE\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 295,
		"path": "../public/assets/users-jXK--NAZ.js"
	},
	"/assets/utils-C2iKZ1M-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9147-SfsIaeBwLkeyz7Pley/gmMadTaY\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 37191,
		"path": "../public/assets/utils-C2iKZ1M-.js"
	},
	"/assets/verify-C13N-TtV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c7c-kR+DLqOHUh9TjjhVlU11oe2Rcwc\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 3196,
		"path": "../public/assets/verify-C13N-TtV.js"
	},
	"/assets/video-Bw-8IPEz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed-4Q+FcC3gRwY/08qPkWFYCoE2p/k\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 237,
		"path": "../public/assets/video-Bw-8IPEz.js"
	},
	"/assets/volume-x-CUxMc2qU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-sB0hwxl3WGGDAD7a91EtFGmeIkQ\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 716,
		"path": "../public/assets/volume-x-CUxMc2qU.js"
	},
	"/assets/wallet-C3u17vR7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bd1-zvH/S2wQb8MP0WtMEUQ27Yn0x3I\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 7121,
		"path": "../public/assets/wallet-C3u17vR7.js"
	},
	"/assets/welcome-CVxpG5D_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f5f-3G7TNDfTecEoNsEa0nsMZ3THkwQ\"",
		"mtime": "2026-10-29T10:46:24.165Z",
		"size": 3935,
		"path": "../public/assets/welcome-CVxpG5D_.js"
	},
	"/assets/x-BkkDnsHg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8f-CIwgsPXf0iNFr3qBQvyaiN3yQKs\"",
		"mtime": "2026-10-29T10:46:24.166Z",
		"size": 143,
		"path": "../public/assets/x-BkkDnsHg.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_hpMz2Q = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_hpMz2Q
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
