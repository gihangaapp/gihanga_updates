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
		"mtime": "2026-10-10T04:36:50.636Z",
		"size": 46631,
		"path": "../public/apple-touch-icon.png"
	},
	"/favicon-96x96.png": {
		"type": "image/png",
		"etag": "\"3f11-1S3FKqkD+0Bj/7AI97EnMoTaiRE\"",
		"mtime": "2026-10-10T04:36:50.560Z",
		"size": 16145,
		"path": "../public/favicon-96x96.png"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"3aee-Achds14k8G0bVzfW0qbWM6yMPLk\"",
		"mtime": "2026-10-10T04:36:50.616Z",
		"size": 15086,
		"path": "../public/favicon.ico"
	},
	"/web-app-manifest-192x192.png": {
		"type": "image/png",
		"etag": "\"cc31-NZ/5ibBtEBotZXdhJVaT9i2VSag\"",
		"mtime": "2026-10-10T04:36:50.581Z",
		"size": 52273,
		"path": "../public/web-app-manifest-192x192.png"
	},
	"/site.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"1cf-EKPn24rb01utiCI0tfC0FTBH0VQ\"",
		"mtime": "2026-10-10T04:36:50.596Z",
		"size": 463,
		"path": "../public/site.webmanifest"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ae-hLVBrSrDdpIw3Xl0dJPRkupPepQ\"",
		"mtime": "2026-10-10T04:36:50.652Z",
		"size": 174,
		"path": "../public/robots.txt"
	},
	"/assets/AdBadge-C40rC8NJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27c-B6Y/4OZVsaQKi7b0QXo3Tbn/5Ys\"",
		"mtime": "2026-10-10T05:50:04.850Z",
		"size": 636,
		"path": "../public/assets/AdBadge-C40rC8NJ.js"
	},
	"/assets/AdPreview-Dz6QHkhz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10c5-AkQOns5HTpgRcnrDlmaicWhNMj8\"",
		"mtime": "2026-10-10T05:50:04.850Z",
		"size": 4293,
		"path": "../public/assets/AdPreview-Dz6QHkhz.js"
	},
	"/assets/ads-0CJBTVQL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80aa-ZVbEdyujlZepLfwWMDatmYmHZIE\"",
		"mtime": "2026-10-10T05:50:04.966Z",
		"size": 32938,
		"path": "../public/assets/ads-0CJBTVQL.js"
	},
	"/assets/api-client-DZYDJusM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"de1-dXHcxJKFtWDtg9aMMxcwk4XThgg\"",
		"mtime": "2026-10-10T05:50:05.026Z",
		"size": 3553,
		"path": "../public/assets/api-client-DZYDJusM.js"
	},
	"/assets/AuthFields-C0b5Oujs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a97-dmURhLqzTMf9KkltoC695fW9n+w\"",
		"mtime": "2026-10-10T05:50:04.858Z",
		"size": 2711,
		"path": "../public/assets/AuthFields-C0b5Oujs.js"
	},
	"/assets/auth-context-Bg6EB-a_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"abe7-v9W9JrNvtQb5Ehf5LTHTmZ2T1d0\"",
		"mtime": "2026-10-10T05:50:05.027Z",
		"size": 44007,
		"path": "../public/assets/auth-context-Bg6EB-a_.js"
	},
	"/assets/AuthLayout-Dz-QKnNk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"820-cl2A2s+Sru8bYHBqFI1DRprfwIU\"",
		"mtime": "2026-10-10T05:50:04.867Z",
		"size": 2080,
		"path": "../public/assets/AuthLayout-Dz-QKnNk.js"
	},
	"/assets/award-BrLU41nX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112-BBdDYPY4NcLim7GLObgpU7bgFNY\"",
		"mtime": "2026-10-10T05:50:05.045Z",
		"size": 274,
		"path": "../public/assets/award-BrLU41nX.js"
	},
	"/assets/badge-check-DAiEEMXF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-RGetv2FYfsZM12vMd2Dg5V5RMbk\"",
		"mtime": "2026-10-10T05:50:05.046Z",
		"size": 316,
		"path": "../public/assets/badge-check-DAiEEMXF.js"
	},
	"/web-app-manifest-512x512.png": {
		"type": "image/png",
		"etag": "\"4af5c-tHFQROc/STVuhgHautyMaL1jY1I\"",
		"mtime": "2026-10-10T04:36:50.469Z",
		"size": 307036,
		"path": "../public/web-app-manifest-512x512.png"
	},
	"/assets/bookmarks-CnYvRdRv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"104d-PT712ZxnWIYC0Ib7RO5f4IYuxag\"",
		"mtime": "2026-10-10T05:50:05.047Z",
		"size": 4173,
		"path": "../public/assets/bookmarks-CnYvRdRv.js"
	},
	"/assets/button-CGJJhG3Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b5-V/6z0KaW3NuhpjYVQvGCD37Ji5Y\"",
		"mtime": "2026-10-10T05:50:05.066Z",
		"size": 5045,
		"path": "../public/assets/button-CGJJhG3Z.js"
	},
	"/assets/check-DO1r_eZj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7c-XaI+rXliOgIqEDRlRZoRgGbL3nc\"",
		"mtime": "2026-10-10T05:50:05.066Z",
		"size": 124,
		"path": "../public/assets/check-DO1r_eZj.js"
	},
	"/assets/chevron-up-CcCnbnfn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-r2fhfoedNJjp0NKI71QCfL6G+Gw\"",
		"mtime": "2026-10-10T05:50:05.079Z",
		"size": 128,
		"path": "../public/assets/chevron-up-CcCnbnfn.js"
	},
	"/assets/circle-DQrQTGbB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf-ptXUEOyzUlIXmA1kya50JzvlAsw\"",
		"mtime": "2026-10-10T05:50:05.080Z",
		"size": 207,
		"path": "../public/assets/circle-DQrQTGbB.js"
	},
	"/assets/clsx-DB0hHKMi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"171-ECuaYbqpb4owKgP3JEL6PnaLhH4\"",
		"mtime": "2026-10-10T05:50:05.112Z",
		"size": 369,
		"path": "../public/assets/clsx-DB0hHKMi.js"
	},
	"/assets/coins-BZBQf_46.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d-vsqcvAzmMIYP+e8i924tYRUMpF0\"",
		"mtime": "2026-10-10T05:50:05.114Z",
		"size": 285,
		"path": "../public/assets/coins-BZBQf_46.js"
	},
	"/assets/AreaChart-tRky6ygj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5cdc7-WuPB2Ve0ZoqCwvby5Gfejud2D5U\"",
		"mtime": "2026-10-10T05:50:04.854Z",
		"size": 380359,
		"path": "../public/assets/AreaChart-tRky6ygj.js"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"1bcd3b-YNxEwdVItKEaK3cYNNT22I5W2Bk\"",
		"mtime": "2026-10-10T04:36:50.538Z",
		"size": 1822011,
		"path": "../public/favicon.svg"
	},
	"/assets/CommentSheet-BLtQPlUx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"293e-OnEjjxBwslPdq8NwfHSvVG8Z8O0\"",
		"mtime": "2026-10-10T05:50:04.880Z",
		"size": 10558,
		"path": "../public/assets/CommentSheet-BLtQPlUx.js"
	},
	"/assets/createLucideIcon-CRXPJZT_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2690-Zh9RpzGclFQ1PSKEAVCJ5gKu5gE\"",
		"mtime": "2026-10-10T05:50:05.114Z",
		"size": 9872,
		"path": "../public/assets/createLucideIcon-CRXPJZT_.js"
	},
	"/assets/dist-C_5Cls21.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1367-m1dnm9uFwIR2N2vfKQahDw+1AWU\"",
		"mtime": "2026-10-10T05:50:05.115Z",
		"size": 4967,
		"path": "../public/assets/dist-C_5Cls21.js"
	},
	"/assets/dist-mAxHwfE5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8cbe-Lbb4L+25MZgfYmNVs4gxaKhzqk8\"",
		"mtime": "2026-10-10T05:50:05.129Z",
		"size": 36030,
		"path": "../public/assets/dist-mAxHwfE5.js"
	},
	"/assets/dollar-sign-DLU8Q5gs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"db-CeGtoFjIK+CW0snvaDThqZyawV4\"",
		"mtime": "2026-10-10T05:50:05.130Z",
		"size": 219,
		"path": "../public/assets/dollar-sign-DLU8Q5gs.js"
	},
	"/assets/ellipsis-vertical-O7dTDOem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"eb-Opm6mD1fhLcJpQIric5eBpWceUg\"",
		"mtime": "2026-10-10T05:50:05.141Z",
		"size": 235,
		"path": "../public/assets/ellipsis-vertical-O7dTDOem.js"
	},
	"/assets/eye-off-f4ZFWuWK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ae-7kwbHZuwFej0517ZCLY5az0wkJU\"",
		"mtime": "2026-10-10T05:50:05.143Z",
		"size": 430,
		"path": "../public/assets/eye-off-f4ZFWuWK.js"
	},
	"/assets/forgot-password-D7_EKs0R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"866-Wq4Zc8/nQZDOcaibghdT0H1Jqiw\"",
		"mtime": "2026-10-10T05:50:05.152Z",
		"size": 2150,
		"path": "../public/assets/forgot-password-D7_EKs0R.js"
	},
	"/assets/gift-C8ul8jHC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15d-0NCI7o9BPbl38hywHanUPxF6Rns\"",
		"mtime": "2026-10-10T05:50:05.154Z",
		"size": 349,
		"path": "../public/assets/gift-C8ul8jHC.js"
	},
	"/assets/grid-3x3-DUM6OXBI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-7Akd7k4a1s/bKvOuWhCqsp3OcCk\"",
		"mtime": "2026-10-10T05:50:05.163Z",
		"size": 295,
		"path": "../public/assets/grid-3x3-DUM6OXBI.js"
	},
	"/assets/history-zOxfTaPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed-vWf6qxxN3u5e/wv6Et1v8vUCJU0\"",
		"mtime": "2026-10-10T05:50:05.171Z",
		"size": 237,
		"path": "../public/assets/history-zOxfTaPw.js"
	},
	"/assets/interests-ChsU8cPL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a00-9Kq/5+m0YDCKocu29YRIGSVJLIw\"",
		"mtime": "2026-10-10T05:50:05.201Z",
		"size": 2560,
		"path": "../public/assets/interests-ChsU8cPL.js"
	},
	"/assets/layers-CL6ypWH6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a5-Nn4kne/G4cbW+MHVbwyFnX1p0f8\"",
		"mtime": "2026-10-10T05:50:05.201Z",
		"size": 421,
		"path": "../public/assets/layers-CL6ypWH6.js"
	},
	"/assets/link-BrcUDEvw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c00-PNaVARg1phn7FsWq2SU6aHtInXA\"",
		"mtime": "2026-10-10T05:50:05.218Z",
		"size": 11264,
		"path": "../public/assets/link-BrcUDEvw.js"
	},
	"/assets/live-Isu242BK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30a4-IozIMqF/+ShLFlQ1fQIrCpNUoUA\"",
		"mtime": "2026-10-10T05:50:05.228Z",
		"size": 12452,
		"path": "../public/assets/live-Isu242BK.js"
	},
	"/assets/log-out-CkMwhfMs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b5-ppIV7Vd315fdjZcD53OheOGwLwE\"",
		"mtime": "2026-10-10T05:50:05.232Z",
		"size": 693,
		"path": "../public/assets/log-out-CkMwhfMs.js"
	},
	"/assets/live._streamId-COLnihQA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6a6-zU++r289DE4UNJro0KIGoJp0+sQ\"",
		"mtime": "2026-10-10T05:50:05.230Z",
		"size": 46758,
		"path": "../public/assets/live._streamId-COLnihQA.js"
	},
	"/assets/login-BXbCNpzf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d58-/hFsvpolwUXH8J2ZMdSOoujaV44\"",
		"mtime": "2026-10-10T05:50:05.233Z",
		"size": 3416,
		"path": "../public/assets/login-BXbCNpzf.js"
	},
	"/assets/mail-UGl0-1Tr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d5-Xw+TPRCO7zB2oKU7NzJA7jhcDGI\"",
		"mtime": "2026-10-10T05:50:05.300Z",
		"size": 213,
		"path": "../public/assets/mail-UGl0-1Tr.js"
	},
	"/assets/live-room-Bt2ar0G_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8574b-CaoJNZUKpTCfX3Jv/P74yobjiL8\"",
		"mtime": "2026-10-10T05:50:05.229Z",
		"size": 546635,
		"path": "../public/assets/live-room-Bt2ar0G_.js"
	},
	"/assets/index-DoysL5o8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10306e-Nuy6X6L5acC2Cl/JilDPmG674xg\"",
		"mtime": "2026-10-10T05:50:04.849Z",
		"size": 1060974,
		"path": "../public/assets/index-DoysL5o8.js"
	},
	"/assets/enable section-BMjT5lF0.png": {
		"type": "image/png",
		"etag": "\"19124a-CBKiIXf2PGFpMBNP4QwF7T9NZSk\"",
		"mtime": "2026-10-10T05:50:06.692Z",
		"size": 1643082,
		"path": "../public/assets/enable section-BMjT5lF0.png"
	},
	"/assets/Heropage_image-D9IuWn3m.png": {
		"type": "image/png",
		"etag": "\"1d13b4-8MRP3LgT1Ap5mUUCmTGdWlhDYbk\"",
		"mtime": "2026-10-10T05:50:06.557Z",
		"size": 1905588,
		"path": "../public/assets/Heropage_image-D9IuWn3m.png"
	},
	"/assets/Match-2sxbyZGR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11b8-KS1YeckWhtNmP+LOis1VVNlVtc0\"",
		"mtime": "2026-10-10T05:50:04.884Z",
		"size": 4536,
		"path": "../public/assets/Match-2sxbyZGR.js"
	},
	"/assets/logo-DsDyB9Dx.png": {
		"type": "image/png",
		"etag": "\"1a26a2-DvE76b7lVXrUIU7yfr/0bbH0s4o\"",
		"mtime": "2026-10-10T05:50:06.709Z",
		"size": 1713826,
		"path": "../public/assets/logo-DsDyB9Dx.png"
	},
	"/assets/permissions-D70WSXvk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"43a-E2nUrFf4Kcum4xA6P1woWsppfdw\"",
		"mtime": "2026-10-10T05:50:05.342Z",
		"size": 1082,
		"path": "../public/assets/permissions-D70WSXvk.js"
	},
	"/assets/notifications-6Ck8OXUc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1043-P50hqe9M/eW4M/g49JYdfQDDGAk\"",
		"mtime": "2026-10-10T05:50:05.317Z",
		"size": 4163,
		"path": "../public/assets/notifications-6Ck8OXUc.js"
	},
	"/assets/post._postId-CPfy6KWY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5bd-1tMNzW+Ll7Aqo0YaH3qj0lGuzDw\"",
		"mtime": "2026-10-10T05:50:05.343Z",
		"size": 1469,
		"path": "../public/assets/post._postId-CPfy6KWY.js"
	},
	"/assets/PostSkeleton-BFaEKQvB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bb-PcbQKTlCiuLfnxk1CyFMkSl47UQ\"",
		"mtime": "2026-10-10T05:50:04.904Z",
		"size": 955,
		"path": "../public/assets/PostSkeleton-BFaEKQvB.js"
	},
	"/assets/PostCard-gPCJA0QJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"43ad-d36mbuU3nxiGUWdE1wYIZiCSOjE\"",
		"mtime": "2026-10-10T05:50:04.893Z",
		"size": 17325,
		"path": "../public/assets/PostCard-gPCJA0QJ.js"
	},
	"/assets/preload-helper-B2fviOpp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"707-f98O4jEecX//GQnhmR1YV/4Md2w\"",
		"mtime": "2026-10-10T05:50:05.355Z",
		"size": 1799,
		"path": "../public/assets/preload-helper-B2fviOpp.js"
	},
	"/assets/progress-D0zPEZvn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d5-BuEMQyOpdNAkSumJxLTYHLsc2a4\"",
		"mtime": "2026-10-10T05:50:05.358Z",
		"size": 2261,
		"path": "../public/assets/progress-D0zPEZvn.js"
	},
	"/assets/profile._username-CZcbMlXz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61e5-PO5TsfW5TOJM71jFVIHdnR3zJFA\"",
		"mtime": "2026-10-10T05:50:05.356Z",
		"size": 25061,
		"path": "../public/assets/profile._username-CZcbMlXz.js"
	},
	"/assets/QueryClientProvider-B--_wsv7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-VIsYXIIu3fCaZSZlzF75kxJoMEc\"",
		"mtime": "2026-10-10T05:50:04.911Z",
		"size": 385,
		"path": "../public/assets/QueryClientProvider-B--_wsv7.js"
	},
	"/assets/reels-CbQsJPvX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4918-oREMjuK+4qHS45Klbw0vMjeZVy8\"",
		"mtime": "2026-10-10T05:50:05.376Z",
		"size": 18712,
		"path": "../public/assets/reels-CbQsJPvX.js"
	},
	"/assets/register-DDbyBpAX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a1d-DJPy3FB+AeNzKXydNz9tKtuSLxk\"",
		"mtime": "2026-10-10T05:50:05.378Z",
		"size": 18973,
		"path": "../public/assets/register-DDbyBpAX.js"
	},
	"/assets/react-If_eLnS3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d85d-Or+WKtlhKCZGubNzXoiqwsadOzQ\"",
		"mtime": "2026-10-10T05:50:05.360Z",
		"size": 120925,
		"path": "../public/assets/react-If_eLnS3.js"
	},
	"/assets/reset-password-BNkfXJUl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd5-eS00XDSN14AUVxrmEpauG42bfMU\"",
		"mtime": "2026-10-10T05:50:05.390Z",
		"size": 3029,
		"path": "../public/assets/reset-password-BNkfXJUl.js"
	},
	"/assets/root-DLTE-HSj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20-vSYConOtSP6ciwr9zKsPixNwWmc\"",
		"mtime": "2026-10-10T05:50:05.392Z",
		"size": 32,
		"path": "../public/assets/root-DLTE-HSj.js"
	},
	"/assets/rotate-ccw-DVYC0OBA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c8-IJhMpaE41usle1pYHHDBPL071r8\"",
		"mtime": "2026-10-10T05:50:05.410Z",
		"size": 200,
		"path": "../public/assets/rotate-ccw-DVYC0OBA.js"
	},
	"/assets/save-BeenomuE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"147-vCvnm7u8iWHspiB54YjuBs38oCA\"",
		"mtime": "2026-10-10T05:50:05.435Z",
		"size": 327,
		"path": "../public/assets/save-BeenomuE.js"
	},
	"/assets/routes-B_Q5tIJv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"476d-huT2YvB83WW/Wdccl1DaEJGGzRc\"",
		"mtime": "2026-10-10T05:50:05.411Z",
		"size": 18285,
		"path": "../public/assets/routes-B_Q5tIJv.js"
	},
	"/assets/shield-alert-Drr4xUaX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"161-Dqd7l7SgO8DmrqNgcqsaNwKsDU0\"",
		"mtime": "2026-10-10T05:50:05.467Z",
		"size": 353,
		"path": "../public/assets/shield-alert-Drr4xUaX.js"
	},
	"/assets/smartphone-C5IMF65B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-7VAoEbkTMeQ7oQOZ3/fjAJwJBQ8\"",
		"mtime": "2026-10-10T05:50:05.474Z",
		"size": 312,
		"path": "../public/assets/smartphone-C5IMF65B.js"
	},
	"/assets/SocialButtons-AaXP_bU-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"703-VuOx42dPMPiUmLsJT5MXy12gPoI\"",
		"mtime": "2026-10-10T05:50:04.928Z",
		"size": 1795,
		"path": "../public/assets/SocialButtons-AaXP_bU-.js"
	},
	"/assets/StaffUI-CRgoLkhT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab2-Rs1WUUW99EG+tz/6FoBn9D1dxos\"",
		"mtime": "2026-10-10T05:50:04.949Z",
		"size": 2738,
		"path": "../public/assets/StaffUI-CRgoLkhT.js"
	},
	"/assets/studio-FLDJtM8S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b76-A8RNWo8Ua1pT8yWvBkFW1I+PeEs\"",
		"mtime": "2026-10-10T05:50:05.527Z",
		"size": 35702,
		"path": "../public/assets/studio-FLDJtM8S.js"
	},
	"/assets/styleguide-m083tQNl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b20-wCXcmdSrbo4bvjJYKgBbhcDoQgs\"",
		"mtime": "2026-10-10T05:50:05.545Z",
		"size": 6944,
		"path": "../public/assets/styleguide-m083tQNl.js"
	},
	"/assets/styles-BVLTwO6-.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"29581-J/VtDv8TCTGTYx4GSbv1oRF9NHM\"",
		"mtime": "2026-10-10T05:50:06.716Z",
		"size": 169345,
		"path": "../public/assets/styles-BVLTwO6-.css"
	},
	"/assets/system.dashboard-D9PrdSil.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"245c-ifn9tHxN+B2WLdfZ+j2AV0JvCco\"",
		"mtime": "2026-10-10T05:50:05.547Z",
		"size": 9308,
		"path": "../public/assets/system.dashboard-D9PrdSil.js"
	},
	"/assets/system.dashboard.accounts-Dm2e0Ap8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"220d-dUyflZyJvZSL4PhcHHsocvoRoaA\"",
		"mtime": "2026-10-10T05:50:05.564Z",
		"size": 8717,
		"path": "../public/assets/system.dashboard.accounts-Dm2e0Ap8.js"
	},
	"/assets/system.dashboard.achievements-B1PKJOE8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1906-ux1ZF0HpVPJztbGTeyMjGESBk6Y\"",
		"mtime": "2026-10-10T05:50:05.597Z",
		"size": 6406,
		"path": "../public/assets/system.dashboard.achievements-B1PKJOE8.js"
	},
	"/assets/system.dashboard.activity-B-_SCJTd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a36-cJhKPQjPLPDBbf30GLkusjd1ZXU\"",
		"mtime": "2026-10-10T05:50:05.610Z",
		"size": 2614,
		"path": "../public/assets/system.dashboard.activity-B-_SCJTd.js"
	},
	"/assets/system.dashboard.ad-settings-ycpoSPr5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-I0neC7wCNEmx/wtDT/jfnGQ28Ts\"",
		"mtime": "2026-10-10T05:50:05.628Z",
		"size": 8720,
		"path": "../public/assets/system.dashboard.ad-settings-ycpoSPr5.js"
	},
	"/assets/system.dashboard.audit-CZWc2QLa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c50-aY4az98kG+HddTCO0/FD9GN7xs0\"",
		"mtime": "2026-10-10T05:50:05.630Z",
		"size": 3152,
		"path": "../public/assets/system.dashboard.audit-CZWc2QLa.js"
	},
	"/assets/system.dashboard.campaigns-DA7NzWGT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2790-eRo4VsbpgttyLgf67J7Ijvl6unY\"",
		"mtime": "2026-10-10T05:50:05.650Z",
		"size": 10128,
		"path": "../public/assets/system.dashboard.campaigns-DA7NzWGT.js"
	},
	"/assets/system.dashboard.growth-DuGjH2eG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cbe-fVPtbXWgYGss9yDnJFBJHK2nA7k\"",
		"mtime": "2026-10-10T05:50:05.651Z",
		"size": 3262,
		"path": "../public/assets/system.dashboard.growth-DuGjH2eG.js"
	},
	"/assets/system.dashboard.index-DLba0UCI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"de5-w309Q/iSuXHkXb0GscaKVeAgM2M\"",
		"mtime": "2026-10-10T05:50:05.660Z",
		"size": 3557,
		"path": "../public/assets/system.dashboard.index-DLba0UCI.js"
	},
	"/assets/system.dashboard.live-DhULKIIQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1802-JAp215xmIApm8OVhcFbzGei1gyk\"",
		"mtime": "2026-10-10T05:50:05.661Z",
		"size": 6146,
		"path": "../public/assets/system.dashboard.live-DhULKIIQ.js"
	},
	"/assets/system.dashboard.moderation-a4JPZu5P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef8-gMPGqY8ilOOIXNTQhkc18DTk9x4\"",
		"mtime": "2026-10-10T05:50:05.665Z",
		"size": 7928,
		"path": "../public/assets/system.dashboard.moderation-a4JPZu5P.js"
	},
	"/assets/system.dashboard.payments-BER3hrsW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ea8-e2LJeUYHIFCtTeXwH2AmX+wXO80\"",
		"mtime": "2026-10-10T05:50:05.666Z",
		"size": 3752,
		"path": "../public/assets/system.dashboard.payments-BER3hrsW.js"
	},
	"/assets/system.dashboard.rewards-Bj4FDjSK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6a-YCdeoxZw6/mHTeLG24/sT5WWgxQ\"",
		"mtime": "2026-10-10T05:50:05.713Z",
		"size": 3178,
		"path": "../public/assets/system.dashboard.rewards-Bj4FDjSK.js"
	},
	"/assets/system.dashboard.settings-DqhjUM2t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1410-nM5BYFGkTyU5uLRLQCY4+6UiiYA\"",
		"mtime": "2026-10-10T05:50:05.714Z",
		"size": 5136,
		"path": "../public/assets/system.dashboard.settings-DqhjUM2t.js"
	},
	"/assets/system.dashboard.staff-CIdTQWUE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b02-OIBjDNIS6GSe+mizODTP725XOnA\"",
		"mtime": "2026-10-10T05:50:05.761Z",
		"size": 6914,
		"path": "../public/assets/system.dashboard.staff-CIdTQWUE.js"
	},
	"/assets/system.index-D510pSN6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12ff-Tc6ECweP4XEHJRlqbhTvvyYynnY\"",
		"mtime": "2026-10-10T05:50:05.764Z",
		"size": 4863,
		"path": "../public/assets/system.index-D510pSN6.js"
	},
	"/assets/tag._tag-Bu5Tat82.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b1e-lqi+7cD+CY3xcI8+KW8dxsHCnng\"",
		"mtime": "2026-10-10T05:50:05.765Z",
		"size": 2846,
		"path": "../public/assets/tag._tag-Bu5Tat82.js"
	},
	"/assets/target-CT4UV5D8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-NhmS4lv/LOpuf3pgfuSByvv0jGM\"",
		"mtime": "2026-10-10T05:50:05.766Z",
		"size": 226,
		"path": "../public/assets/target-CT4UV5D8.js"
	},
	"/assets/use-ads-bqzZ-KQN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fa6-efuFwwm2hiGu75COlvALLD3XxOg\"",
		"mtime": "2026-10-10T05:50:05.882Z",
		"size": 4006,
		"path": "../public/assets/use-ads-bqzZ-KQN.js"
	},
	"/assets/use-staff-finance-Cl3gjThp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d9-dVLn0pmrk6IVTjDN5G0CYH1NTpg\"",
		"mtime": "2026-10-10T05:50:05.928Z",
		"size": 985,
		"path": "../public/assets/use-staff-finance-Cl3gjThp.js"
	},
	"/assets/use-staff-management-CglCUZm7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"807-CNrpuwK4AMb/d0Dq4+Bwatr3IjQ\"",
		"mtime": "2026-10-10T05:50:06.012Z",
		"size": 2055,
		"path": "../public/assets/use-staff-management-CglCUZm7.js"
	},
	"/assets/use-staff-notifications-CxH7qLl-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ab-ywKclyUR10se8ZvlYkeQd+P3yFY\"",
		"mtime": "2026-10-10T05:50:06.110Z",
		"size": 1451,
		"path": "../public/assets/use-staff-notifications-CxH7qLl-.js"
	},
	"/assets/use-wallet-CowcW5Zx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b4-Iz4ni8cWFCQPWoRwGLXY7Sra7fw\"",
		"mtime": "2026-10-10T05:50:06.157Z",
		"size": 948,
		"path": "../public/assets/use-wallet-CowcW5Zx.js"
	},
	"/assets/useMatch-CgkzJcZK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"275-QfEKuSAaw3xEWfhvSWQsUvm57gY\"",
		"mtime": "2026-10-10T05:50:06.158Z",
		"size": 629,
		"path": "../public/assets/useMatch-CgkzJcZK.js"
	},
	"/assets/useMutation-Cd9_IpKh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15ed-4G6nHna23OySxt80o9ZnGR1SMUs\"",
		"mtime": "2026-10-10T05:50:06.161Z",
		"size": 5613,
		"path": "../public/assets/useMutation-Cd9_IpKh.js"
	},
	"/assets/useNavigate-sAfHcBjl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e9-GGGbBCV7aN1DUK70e36TG/xuTxM\"",
		"mtime": "2026-10-10T05:50:06.230Z",
		"size": 233,
		"path": "../public/assets/useNavigate-sAfHcBjl.js"
	},
	"/assets/useQuery-B76QBTbu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5c86-77OK5Z3hzpYzzvnwDS7Uo7TISQc\"",
		"mtime": "2026-10-10T05:50:06.235Z",
		"size": 23686,
		"path": "../public/assets/useQuery-B76QBTbu.js"
	},
	"/assets/useRouter-kUxBpUuj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9c-mvV9nNWOnm6PvQp2JVa5fHF7JsE\"",
		"mtime": "2026-10-10T05:50:06.239Z",
		"size": 156,
		"path": "../public/assets/useRouter-kUxBpUuj.js"
	},
	"/assets/verify-C5FYVlGo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca3-vQL5i5iSuwrhFGwrA11Hi2O6BjY\"",
		"mtime": "2026-10-10T05:50:06.249Z",
		"size": 3235,
		"path": "../public/assets/verify-C5FYVlGo.js"
	},
	"/assets/utils-BWfyOJOq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6936-JN3ZY6ohfWfPHA2u8SMsyZt/17A\"",
		"mtime": "2026-10-10T05:50:06.241Z",
		"size": 26934,
		"path": "../public/assets/utils-BWfyOJOq.js"
	},
	"/assets/volume-x-BCPdQ7Fi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d7-yGGLP4pL3y4XwHHs/MLRcRv16Qw\"",
		"mtime": "2026-10-10T05:50:06.339Z",
		"size": 727,
		"path": "../public/assets/volume-x-BCPdQ7Fi.js"
	},
	"/assets/wallet-DORkcBue.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bfe-LqPbPwmCJ+wvkyG9JjIl3bEHSrI\"",
		"mtime": "2026-10-10T05:50:06.397Z",
		"size": 7166,
		"path": "../public/assets/wallet-DORkcBue.js"
	},
	"/assets/welcome-CgHkJfZT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4a-DR9ggGaJzQ7VuRYK8Tpc0FR/Xw0\"",
		"mtime": "2026-10-10T05:50:06.466Z",
		"size": 3914,
		"path": "../public/assets/welcome-CgHkJfZT.js"
	},
	"/assets/x-JLYjteJy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-ksvN0TfXMdPifXk+ucGMD6yK5PM\"",
		"mtime": "2026-10-10T05:50:06.543Z",
		"size": 154,
		"path": "../public/assets/x-JLYjteJy.js"
	},
	"/assets/_-DffRFPrx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49f-/2/rToi1hN2z+BeK7prg27KVEJU\"",
		"mtime": "2026-10-10T05:50:04.955Z",
		"size": 1183,
		"path": "../public/assets/_-DffRFPrx.js"
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
var _lazy_eR0h2B = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_eR0h2B
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
