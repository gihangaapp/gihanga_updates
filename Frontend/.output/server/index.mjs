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
		"mtime": "2026-10-19T23:32:51.379Z",
		"size": 46631,
		"path": "../public/apple-touch-icon.png"
	},
	"/favicon-96x96.png": {
		"type": "image/png",
		"etag": "\"3f11-1S3FKqkD+0Bj/7AI97EnMoTaiRE\"",
		"mtime": "2026-10-19T23:32:51.379Z",
		"size": 16145,
		"path": "../public/favicon-96x96.png"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"3aee-Achds14k8G0bVzfW0qbWM6yMPLk\"",
		"mtime": "2026-10-19T23:32:51.379Z",
		"size": 15086,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ae-hLVBrSrDdpIw3Xl0dJPRkupPepQ\"",
		"mtime": "2026-10-19T23:32:51.380Z",
		"size": 174,
		"path": "../public/robots.txt"
	},
	"/site.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"1cf-EKPn24rb01utiCI0tfC0FTBH0VQ\"",
		"mtime": "2026-10-19T23:32:51.380Z",
		"size": 463,
		"path": "../public/site.webmanifest"
	},
	"/web-app-manifest-192x192.png": {
		"type": "image/png",
		"etag": "\"cc31-NZ/5ibBtEBotZXdhJVaT9i2VSag\"",
		"mtime": "2026-10-19T23:32:51.380Z",
		"size": 52273,
		"path": "../public/web-app-manifest-192x192.png"
	},
	"/web-app-manifest-512x512.png": {
		"type": "image/png",
		"etag": "\"4af5c-tHFQROc/STVuhgHautyMaL1jY1I\"",
		"mtime": "2026-10-19T23:32:51.380Z",
		"size": 307036,
		"path": "../public/web-app-manifest-512x512.png"
	},
	"/assets/AdBadge-BNozofY0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27c-dM4kZ66ld7OZTyIQD5HKZFhbt/c\"",
		"mtime": "2026-10-19T23:32:49.144Z",
		"size": 636,
		"path": "../public/assets/AdBadge-BNozofY0.js"
	},
	"/assets/AdPreview-D6PDAUJC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10c5-mdpuZfEvX71+tt7naU3Jh64jIe8\"",
		"mtime": "2026-10-19T23:32:49.144Z",
		"size": 4293,
		"path": "../public/assets/AdPreview-D6PDAUJC.js"
	},
	"/assets/AreaChart-tRky6ygj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5cdc7-WuPB2Ve0ZoqCwvby5Gfejud2D5U\"",
		"mtime": "2026-10-19T23:32:49.144Z",
		"size": 380359,
		"path": "../public/assets/AreaChart-tRky6ygj.js"
	},
	"/assets/AuthFields-MU9wOaF2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a97-dBHziN8kAOborLi8wvBgSo32CLM\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 2711,
		"path": "../public/assets/AuthFields-MU9wOaF2.js"
	},
	"/assets/AuthLayout-CRbcKzwJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"825-PBoee0zKyyOsmcW0Ogjowsc7RQ8\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 2085,
		"path": "../public/assets/AuthLayout-CRbcKzwJ.js"
	},
	"/assets/CommentSheet-Co_vgvUl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"295f-K1Gu0mYnJy4gPCTBLstTl8pcLWA\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 10591,
		"path": "../public/assets/CommentSheet-Co_vgvUl.js"
	},
	"/assets/Match-2sxbyZGR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11b8-KS1YeckWhtNmP+LOis1VVNlVtc0\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 4536,
		"path": "../public/assets/Match-2sxbyZGR.js"
	},
	"/assets/PostCard-CQJdGBg4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6079-Yp/Q8BhKk4opSzPcUEhNdZxIJ6o\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 24697,
		"path": "../public/assets/PostCard-CQJdGBg4.js"
	},
	"/assets/PostSkeleton-BFaEKQvB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bb-PcbQKTlCiuLfnxk1CyFMkSl47UQ\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 955,
		"path": "../public/assets/PostSkeleton-BFaEKQvB.js"
	},
	"/assets/QueryClientProvider-B--_wsv7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-VIsYXIIu3fCaZSZlzF75kxJoMEc\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 385,
		"path": "../public/assets/QueryClientProvider-B--_wsv7.js"
	},
	"/assets/SocialButtons-AaXP_bU-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"703-VuOx42dPMPiUmLsJT5MXy12gPoI\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 1795,
		"path": "../public/assets/SocialButtons-AaXP_bU-.js"
	},
	"/assets/StaffUI-xIm0cXjE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab2-ld95AswA2/tswKhmyydDQe/3HvM\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 2738,
		"path": "../public/assets/StaffUI-xIm0cXjE.js"
	},
	"/assets/_-C21KmTN5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49f-/BszgMHVATj8LOM7MQZRaq9dksY\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 1183,
		"path": "../public/assets/_-C21KmTN5.js"
	},
	"/assets/activity-aO4wcqH9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ea-54u1TBrOa73nQ+teBQedgEf9ULI\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 234,
		"path": "../public/assets/activity-aO4wcqH9.js"
	},
	"/assets/ads-o5V2FFCh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80a9-ENnQ1Io1XdX7GgKYZAcRaThgIEo\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 32937,
		"path": "../public/assets/ads-o5V2FFCh.js"
	},
	"/assets/api-client-DZYDJusM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"de1-dXHcxJKFtWDtg9aMMxcwk4XThgg\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 3553,
		"path": "../public/assets/api-client-DZYDJusM.js"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"1bcd3b-YNxEwdVItKEaK3cYNNT22I5W2Bk\"",
		"mtime": "2026-10-19T23:32:51.380Z",
		"size": 1822011,
		"path": "../public/favicon.svg"
	},
	"/assets/Heropage_image-D9IuWn3m.png": {
		"type": "image/png",
		"etag": "\"1d13b4-8MRP3LgT1Ap5mUUCmTGdWlhDYbk\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 1905588,
		"path": "../public/assets/Heropage_image-D9IuWn3m.png"
	},
	"/assets/auth-context-Bg6EB-a_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"abe7-v9W9JrNvtQb5Ehf5LTHTmZ2T1d0\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 44007,
		"path": "../public/assets/auth-context-Bg6EB-a_.js"
	},
	"/assets/award-BrLU41nX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112-BBdDYPY4NcLim7GLObgpU7bgFNY\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 274,
		"path": "../public/assets/award-BrLU41nX.js"
	},
	"/assets/badge-check-DAiEEMXF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-RGetv2FYfsZM12vMd2Dg5V5RMbk\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 316,
		"path": "../public/assets/badge-check-DAiEEMXF.js"
	},
	"/assets/bookmarks-2XtqclYe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"104c-rN5puNnHbuWvuCtVNo42YxTgvOU\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 4172,
		"path": "../public/assets/bookmarks-2XtqclYe.js"
	},
	"/assets/browser-live-6tW__Xxn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3ba7-E1xQEwabRwqkzn7XK0W9ynC4CN8\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 15271,
		"path": "../public/assets/browser-live-6tW__Xxn.js"
	},
	"/assets/button-CGJJhG3Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b5-V/6z0KaW3NuhpjYVQvGCD37Ji5Y\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 5045,
		"path": "../public/assets/button-CGJJhG3Z.js"
	},
	"/assets/check-DO1r_eZj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7c-XaI+rXliOgIqEDRlRZoRgGbL3nc\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 124,
		"path": "../public/assets/check-DO1r_eZj.js"
	},
	"/assets/chevron-down-B4UEOhjc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-Sb9iBZrAcfOf9c1SMGmB/hrA3Ks\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 128,
		"path": "../public/assets/chevron-down-B4UEOhjc.js"
	},
	"/assets/chevron-up-CcCnbnfn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-r2fhfoedNJjp0NKI71QCfL6G+Gw\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 128,
		"path": "../public/assets/chevron-up-CcCnbnfn.js"
	},
	"/assets/circle-DQrQTGbB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf-ptXUEOyzUlIXmA1kya50JzvlAsw\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 207,
		"path": "../public/assets/circle-DQrQTGbB.js"
	},
	"/assets/clsx-DB0hHKMi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"171-ECuaYbqpb4owKgP3JEL6PnaLhH4\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 369,
		"path": "../public/assets/clsx-DB0hHKMi.js"
	},
	"/assets/coins-BZBQf_46.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d-vsqcvAzmMIYP+e8i924tYRUMpF0\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 285,
		"path": "../public/assets/coins-BZBQf_46.js"
	},
	"/assets/createLucideIcon-CRXPJZT_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2690-Zh9RpzGclFQ1PSKEAVCJ5gKu5gE\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 9872,
		"path": "../public/assets/createLucideIcon-CRXPJZT_.js"
	},
	"/assets/dist-BjJ47Bq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"284-ksPJhmRjUOEkYwmpm2epJx7rny8\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 644,
		"path": "../public/assets/dist-BjJ47Bq7.js"
	},
	"/assets/dist-C_5Cls21.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1367-m1dnm9uFwIR2N2vfKQahDw+1AWU\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 4967,
		"path": "../public/assets/dist-C_5Cls21.js"
	},
	"/assets/dist-mAxHwfE5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8cbe-Lbb4L+25MZgfYmNVs4gxaKhzqk8\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 36030,
		"path": "../public/assets/dist-mAxHwfE5.js"
	},
	"/assets/dollar-sign-DLU8Q5gs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"db-CeGtoFjIK+CW0snvaDThqZyawV4\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 219,
		"path": "../public/assets/dollar-sign-DLU8Q5gs.js"
	},
	"/assets/ellipsis-vertical-O7dTDOem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"eb-Opm6mD1fhLcJpQIric5eBpWceUg\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 235,
		"path": "../public/assets/ellipsis-vertical-O7dTDOem.js"
	},
	"/assets/eye-off-f4ZFWuWK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ae-7kwbHZuwFej0517ZCLY5az0wkJU\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 430,
		"path": "../public/assets/eye-off-f4ZFWuWK.js"
	},
	"/assets/flag-BqVrLiK4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-mY79+CLhP3VVJnvQ/ABqwgHB/UA\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 254,
		"path": "../public/assets/flag-BqVrLiK4.js"
	},
	"/assets/forgot-password-CXubVnrc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"866-Yz86SLr+1EKz6+5hlSp4Qc9hUF0\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 2150,
		"path": "../public/assets/forgot-password-CXubVnrc.js"
	},
	"/assets/gift-C8ul8jHC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15d-0NCI7o9BPbl38hywHanUPxF6Rns\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 349,
		"path": "../public/assets/gift-C8ul8jHC.js"
	},
	"/assets/grid-3x3-DUM6OXBI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-7Akd7k4a1s/bKvOuWhCqsp3OcCk\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 295,
		"path": "../public/assets/grid-3x3-DUM6OXBI.js"
	},
	"/assets/history-zOxfTaPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed-vWf6qxxN3u5e/wv6Et1v8vUCJU0\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 237,
		"path": "../public/assets/history-zOxfTaPw.js"
	},
	"/assets/enable section-BMjT5lF0.png": {
		"type": "image/png",
		"etag": "\"19124a-CBKiIXf2PGFpMBNP4QwF7T9NZSk\"",
		"mtime": "2026-10-19T23:32:49.148Z",
		"size": 1643082,
		"path": "../public/assets/enable section-BMjT5lF0.png"
	},
	"/assets/interests-BXd1G6Ab.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a00-TQsyLyjg5kh/42uD/jVvO8Wxyyk\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 2560,
		"path": "../public/assets/interests-BXd1G6Ab.js"
	},
	"/assets/layers-CL6ypWH6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a5-Nn4kne/G4cbW+MHVbwyFnX1p0f8\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 421,
		"path": "../public/assets/layers-CL6ypWH6.js"
	},
	"/assets/link-BrcUDEvw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c00-PNaVARg1phn7FsWq2SU6aHtInXA\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 11264,
		"path": "../public/assets/link-BrcUDEvw.js"
	},
	"/assets/live-BWgqXr7A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32de-u77k57ItPDRIW9sHRNXEnBBW1rY\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 13022,
		"path": "../public/assets/live-BWgqXr7A.js"
	},
	"/assets/live._streamId-BnUw5lRC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e845-yjYLFi32n3ritFAHc5RIbhurHfE\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 59461,
		"path": "../public/assets/live._streamId-BnUw5lRC.js"
	},
	"/assets/log-out-CkMwhfMs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b5-ppIV7Vd315fdjZcD53OheOGwLwE\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 693,
		"path": "../public/assets/log-out-CkMwhfMs.js"
	},
	"/assets/login-DF45yHOU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d58-Ga4jYB8WDP5ak5eYlNIQXFLlOXk\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 3416,
		"path": "../public/assets/login-DF45yHOU.js"
	},
	"/assets/mail-UGl0-1Tr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d5-Xw+TPRCO7zB2oKU7NzJA7jhcDGI\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 213,
		"path": "../public/assets/mail-UGl0-1Tr.js"
	},
	"/assets/notifications-BCnRPO1L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1061-e65cXXZ1cGVBamg4r8Uhm1D8xy0\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 4193,
		"path": "../public/assets/notifications-BCnRPO1L.js"
	},
	"/assets/permissions-hXBqCuQJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c6-k2iN/02euBV8QSKNtBTlvN9ZgvM\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 1222,
		"path": "../public/assets/permissions-hXBqCuQJ.js"
	},
	"/assets/post._postId-gpW0hTCZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5bc-o7uEvMaSD2MXAOA0FJ0XLv9WcJ8\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 1468,
		"path": "../public/assets/post._postId-gpW0hTCZ.js"
	},
	"/assets/preload-helper-B2fviOpp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"707-f98O4jEecX//GQnhmR1YV/4Md2w\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 1799,
		"path": "../public/assets/preload-helper-B2fviOpp.js"
	},
	"/assets/profile._username-DdPAHy2P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"621d-X3xfEjtALAaZEP7qGislE05KyIM\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 25117,
		"path": "../public/assets/profile._username-DdPAHy2P.js"
	},
	"/assets/progress-D0zPEZvn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d5-BuEMQyOpdNAkSumJxLTYHLsc2a4\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 2261,
		"path": "../public/assets/progress-D0zPEZvn.js"
	},
	"/assets/radio-DLNQafFj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-MuxnEYZYztroBkMZZEresu6Z75s\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 374,
		"path": "../public/assets/radio-DLNQafFj.js"
	},
	"/assets/react-If_eLnS3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d85d-Or+WKtlhKCZGubNzXoiqwsadOzQ\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 120925,
		"path": "../public/assets/react-If_eLnS3.js"
	},
	"/assets/reels-CFo3gTl3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48eb-cueJMLni86E1H+1D2RGQrXLUmUs\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 18667,
		"path": "../public/assets/reels-CFo3gTl3.js"
	},
	"/assets/register-j9leKIJW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a3d-ycMH/mA++ssVq5MUhsuAHHyTxrY\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 19005,
		"path": "../public/assets/register-j9leKIJW.js"
	},
	"/assets/reset-password-Dtkuhanu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd5-ToJpf0BlDDt7jRyVQ2nhY3UrqUw\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 3029,
		"path": "../public/assets/reset-password-Dtkuhanu.js"
	},
	"/assets/live-room-h4cUUO0H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81e24-wPd2ehtkB2WuYGi4t2HZfKwyPjw\"",
		"mtime": "2026-10-19T23:32:49.145Z",
		"size": 532004,
		"path": "../public/assets/live-room-h4cUUO0H.js"
	},
	"/assets/index-COGpbAMx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"104c88-UHHa9m4ZKRo5OVMgAjFwkfeWYaw\"",
		"mtime": "2026-10-19T23:32:49.144Z",
		"size": 1068168,
		"path": "../public/assets/index-COGpbAMx.js"
	},
	"/assets/root-DLTE-HSj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20-vSYConOtSP6ciwr9zKsPixNwWmc\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 32,
		"path": "../public/assets/root-DLTE-HSj.js"
	},
	"/assets/rotate-ccw-DVYC0OBA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c8-IJhMpaE41usle1pYHHDBPL071r8\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 200,
		"path": "../public/assets/rotate-ccw-DVYC0OBA.js"
	},
	"/assets/logo-DsDyB9Dx.png": {
		"type": "image/png",
		"etag": "\"1a26a2-DvE76b7lVXrUIU7yfr/0bbH0s4o\"",
		"mtime": "2026-10-19T23:32:49.149Z",
		"size": 1713826,
		"path": "../public/assets/logo-DsDyB9Dx.png"
	},
	"/assets/routes-Bh46Gvi1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5381-jRgNRQSBHhUXWUm4vmp7ytUuxRU\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 21377,
		"path": "../public/assets/routes-Bh46Gvi1.js"
	},
	"/assets/save-BeenomuE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"147-vCvnm7u8iWHspiB54YjuBs38oCA\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 327,
		"path": "../public/assets/save-BeenomuE.js"
	},
	"/assets/settings-BUDo4XHL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e7-2kiWDvA1Dr9IdbcPfoAOMuWZOak\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 487,
		"path": "../public/assets/settings-BUDo4XHL.js"
	},
	"/assets/shield-alert-Drr4xUaX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"161-Dqd7l7SgO8DmrqNgcqsaNwKsDU0\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 353,
		"path": "../public/assets/shield-alert-Drr4xUaX.js"
	},
	"/assets/smartphone-C5IMF65B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-7VAoEbkTMeQ7oQOZ3/fjAJwJBQ8\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 312,
		"path": "../public/assets/smartphone-C5IMF65B.js"
	},
	"/assets/studio-rm949cQG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b95-QI7UnYrFw95GvwyMpStzVSqLWls\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 35733,
		"path": "../public/assets/studio-rm949cQG.js"
	},
	"/assets/styleguide-Cy-COedg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b66-f+GOTlbChDt1PK8lCZHZjILZzVw\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 7014,
		"path": "../public/assets/styleguide-Cy-COedg.js"
	},
	"/assets/styles-QTb4sT9q.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"2b80a-L+Nu6TTRTP0VXf8Vq69Cu6AiwvA\"",
		"mtime": "2026-10-19T23:32:49.150Z",
		"size": 178186,
		"path": "../public/assets/styles-QTb4sT9q.css"
	},
	"/assets/switch-ViI0W8yk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e5-JrcX/TpGTJ7bPDVKiL3ac7SyQTE\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 4325,
		"path": "../public/assets/switch-ViI0W8yk.js"
	},
	"/assets/system.dashboard-clYUJ1Zw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24e3-636wr5tJGJY9gaXeFC+K2yNLogI\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 9443,
		"path": "../public/assets/system.dashboard-clYUJ1Zw.js"
	},
	"/assets/system.dashboard.accounts-CuNsZLq0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"220d-jnbmHqJrHjNugGSzoPTH2qgjUuM\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 8717,
		"path": "../public/assets/system.dashboard.accounts-CuNsZLq0.js"
	},
	"/assets/system.dashboard.achievements-BY97Lknx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1927-srCztbVcT0w5wNMl+Tq149GH3oY\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 6439,
		"path": "../public/assets/system.dashboard.achievements-BY97Lknx.js"
	},
	"/assets/system.dashboard.activity-F1qt4XX-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a55-gSSvsdMV2KSR2sd/7lgUW9tRtzg\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 2645,
		"path": "../public/assets/system.dashboard.activity-F1qt4XX-.js"
	},
	"/assets/system.dashboard.ad-settings-Cj-yoNmu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"222f-T3ZB1h9XD04a+Bb4YLjkCIqMV+0\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 8751,
		"path": "../public/assets/system.dashboard.ad-settings-Cj-yoNmu.js"
	},
	"/assets/system.dashboard.audit-CZWc2QLa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c50-aY4az98kG+HddTCO0/FD9GN7xs0\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 3152,
		"path": "../public/assets/system.dashboard.audit-CZWc2QLa.js"
	},
	"/assets/system.dashboard.campaigns-CnS-OCtb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2790-0DPc3yDvqzeM8E+KeI0GVTgmM8A\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 10128,
		"path": "../public/assets/system.dashboard.campaigns-CnS-OCtb.js"
	},
	"/assets/system.dashboard.growth-C0bGrfPF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cde-MM6JpVlvBHbBSvCLluip/KCCUMI\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 3294,
		"path": "../public/assets/system.dashboard.growth-C0bGrfPF.js"
	},
	"/assets/system.dashboard.index-BlpZcjRi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e25-o7h+sfcGBZ7AjA9ZluDBoRhVEnY\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 3621,
		"path": "../public/assets/system.dashboard.index-BlpZcjRi.js"
	},
	"/assets/system.dashboard.live-Cfmh_-7H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1af8-XzvigPjW8aXCxNAyYagyjjCZ8a8\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 6904,
		"path": "../public/assets/system.dashboard.live-Cfmh_-7H.js"
	},
	"/assets/system.dashboard.moderation-DFoDBuPQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4eaa-v/vZve2pd1fGLj4GNOU9qUgUCAM\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 20138,
		"path": "../public/assets/system.dashboard.moderation-DFoDBuPQ.js"
	},
	"/assets/system.dashboard.payments-BFWKW650.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ea8-7fqf7KoUO1N/TZworVdVpD7OKzY\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 3752,
		"path": "../public/assets/system.dashboard.payments-BFWKW650.js"
	},
	"/assets/system.dashboard.rewards-BHIYfjEp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c69-fkbF+h4d0T3eYfmy8pXOQbYInl0\"",
		"mtime": "2026-10-19T23:32:49.146Z",
		"size": 3177,
		"path": "../public/assets/system.dashboard.rewards-BHIYfjEp.js"
	},
	"/assets/system.dashboard.settings-DQEWZg7-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1433-Q3MBzkQvNUhp5OMwf0Uyw9+bC9A\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 5171,
		"path": "../public/assets/system.dashboard.settings-DQEWZg7-.js"
	},
	"/assets/system.dashboard.staff-CrupmC7d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b02-3MnymEuIqSc2wxbnNX0NqVTenkM\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 6914,
		"path": "../public/assets/system.dashboard.staff-CrupmC7d.js"
	},
	"/assets/system.index-CsXWo67Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12ff-T0sBi7kf0Z4Dn+Moq2TI2BuB+4A\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 4863,
		"path": "../public/assets/system.index-CsXWo67Q.js"
	},
	"/assets/tag._tag-tqjkFZCL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b1c-i9LzsuOM5YFovXklp3+2+bufzoM\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 2844,
		"path": "../public/assets/tag._tag-tqjkFZCL.js"
	},
	"/assets/target-CT4UV5D8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-NhmS4lv/LOpuf3pgfuSByvv0jGM\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 226,
		"path": "../public/assets/target-CT4UV5D8.js"
	},
	"/assets/textarea-D2EibPA6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"441-zwniH524ffB36+YcIbYEk7TXb0Q\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 1089,
		"path": "../public/assets/textarea-D2EibPA6.js"
	},
	"/assets/use-ads-bqzZ-KQN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fa6-efuFwwm2hiGu75COlvALLD3XxOg\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 4006,
		"path": "../public/assets/use-ads-bqzZ-KQN.js"
	},
	"/assets/use-live-DVQBsESJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18bd-yFpYBcauslbZQDumdgLV6K0VD9s\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 6333,
		"path": "../public/assets/use-live-DVQBsESJ.js"
	},
	"/assets/use-staff-management-CglCUZm7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"807-CNrpuwK4AMb/d0Dq4+Bwatr3IjQ\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 2055,
		"path": "../public/assets/use-staff-management-CglCUZm7.js"
	},
	"/assets/use-staff-notifications-BkJV7kh0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ef-sOFgaoOsYyfD95RonY9D9wbvWUY\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 1263,
		"path": "../public/assets/use-staff-notifications-BkJV7kh0.js"
	},
	"/assets/use-wallet-CowcW5Zx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b4-Iz4ni8cWFCQPWoRwGLXY7Sra7fw\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 948,
		"path": "../public/assets/use-wallet-CowcW5Zx.js"
	},
	"/assets/useMatch-CgkzJcZK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"275-QfEKuSAaw3xEWfhvSWQsUvm57gY\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 629,
		"path": "../public/assets/useMatch-CgkzJcZK.js"
	},
	"/assets/useMutation-Cd9_IpKh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15ed-4G6nHna23OySxt80o9ZnGR1SMUs\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 5613,
		"path": "../public/assets/useMutation-Cd9_IpKh.js"
	},
	"/assets/useNavigate-sAfHcBjl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e9-GGGbBCV7aN1DUK70e36TG/xuTxM\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 233,
		"path": "../public/assets/useNavigate-sAfHcBjl.js"
	},
	"/assets/useQuery-B76QBTbu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5c86-77OK5Z3hzpYzzvnwDS7Uo7TISQc\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 23686,
		"path": "../public/assets/useQuery-B76QBTbu.js"
	},
	"/assets/useRouter-kUxBpUuj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9c-mvV9nNWOnm6PvQp2JVa5fHF7JsE\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 156,
		"path": "../public/assets/useRouter-kUxBpUuj.js"
	},
	"/assets/users-BO5e0ai2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132-VtCX58WwOhqblxGkOAA9TcPyOmY\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 306,
		"path": "../public/assets/users-BO5e0ai2.js"
	},
	"/assets/utils-BWfyOJOq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6936-JN3ZY6ohfWfPHA2u8SMsyZt/17A\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 26934,
		"path": "../public/assets/utils-BWfyOJOq.js"
	},
	"/assets/verify-CQ3efvKc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca3-AnExuAcgGlYbkaxtXB9ep/gFJ2I\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 3235,
		"path": "../public/assets/verify-CQ3efvKc.js"
	},
	"/assets/video-B_Ztzn8L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f8-IU1qSteLuQhnvZO69x0gAQEkrsE\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 248,
		"path": "../public/assets/video-B_Ztzn8L.js"
	},
	"/assets/volume-x-BCPdQ7Fi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d7-yGGLP4pL3y4XwHHs/MLRcRv16Qw\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 727,
		"path": "../public/assets/volume-x-BCPdQ7Fi.js"
	},
	"/assets/wallet-Cln6Mpkb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bfd-DaONF2OL4tYA0p52E/EjfkCNo1k\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 7165,
		"path": "../public/assets/wallet-Cln6Mpkb.js"
	},
	"/assets/use-staff-finance-Cl3gjThp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d9-dVLn0pmrk6IVTjDN5G0CYH1NTpg\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 985,
		"path": "../public/assets/use-staff-finance-Cl3gjThp.js"
	},
	"/assets/welcome-CkqKuX72.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6a-0VzfZSWhk7lObDcVqwWuR1AvWR4\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 3946,
		"path": "../public/assets/welcome-CkqKuX72.js"
	},
	"/assets/x-JLYjteJy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-ksvN0TfXMdPifXk+ucGMD6yK5PM\"",
		"mtime": "2026-10-19T23:32:49.147Z",
		"size": 154,
		"path": "../public/assets/x-JLYjteJy.js"
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
var _lazy_RM4f3g = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_RM4f3g
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
