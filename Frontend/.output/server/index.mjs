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
	"/favicon-96x96.png": {
		"type": "image/png",
		"etag": "\"3f11-1S3FKqkD+0Bj/7AI97EnMoTaiRE\"",
		"mtime": "2026-10-10T04:36:50.560Z",
		"size": 16145,
		"path": "../public/favicon-96x96.png"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ae-hLVBrSrDdpIw3Xl0dJPRkupPepQ\"",
		"mtime": "2026-10-10T04:36:50.652Z",
		"size": 174,
		"path": "../public/robots.txt"
	},
	"/site.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"1cf-EKPn24rb01utiCI0tfC0FTBH0VQ\"",
		"mtime": "2026-10-10T04:36:50.596Z",
		"size": 463,
		"path": "../public/site.webmanifest"
	},
	"/assets/AdBadge-BEiOGQcr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27c-m+vMX0aWbJbBP70cJL/PZ/f+Iu8\"",
		"mtime": "2026-10-10T04:53:50.619Z",
		"size": 636,
		"path": "../public/assets/AdBadge-BEiOGQcr.js"
	},
	"/assets/AdPreview-DU6WKRg7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10c5-I+SIq6e9hAjuaxvxXOVdFmE3a/0\"",
		"mtime": "2026-10-10T04:53:50.621Z",
		"size": 4293,
		"path": "../public/assets/AdPreview-DU6WKRg7.js"
	},
	"/assets/ads-n3aM8fNJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80aa-HgaTYr5+xliULFdddZ6h6+3ynEE\"",
		"mtime": "2026-10-10T04:53:50.657Z",
		"size": 32938,
		"path": "../public/assets/ads-n3aM8fNJ.js"
	},
	"/assets/api-client-DZYDJusM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"de1-dXHcxJKFtWDtg9aMMxcwk4XThgg\"",
		"mtime": "2026-10-10T04:53:50.660Z",
		"size": 3553,
		"path": "../public/assets/api-client-DZYDJusM.js"
	},
	"/assets/AreaChart-tRky6ygj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5cdc7-WuPB2Ve0ZoqCwvby5Gfejud2D5U\"",
		"mtime": "2026-10-10T04:53:50.622Z",
		"size": 380359,
		"path": "../public/assets/AreaChart-tRky6ygj.js"
	},
	"/assets/auth-context-Bg6EB-a_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"abe7-v9W9JrNvtQb5Ehf5LTHTmZ2T1d0\"",
		"mtime": "2026-10-10T04:53:50.663Z",
		"size": 44007,
		"path": "../public/assets/auth-context-Bg6EB-a_.js"
	},
	"/web-app-manifest-192x192.png": {
		"type": "image/png",
		"etag": "\"cc31-NZ/5ibBtEBotZXdhJVaT9i2VSag\"",
		"mtime": "2026-10-10T04:36:50.581Z",
		"size": 52273,
		"path": "../public/web-app-manifest-192x192.png"
	},
	"/web-app-manifest-512x512.png": {
		"type": "image/png",
		"etag": "\"4af5c-tHFQROc/STVuhgHautyMaL1jY1I\"",
		"mtime": "2026-10-10T04:36:50.469Z",
		"size": 307036,
		"path": "../public/web-app-manifest-512x512.png"
	},
	"/assets/AuthFields-CAYc-9Ns.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a97-qPiUuWqzxCX3Neyx7jUg6l0mDg8\"",
		"mtime": "2026-10-10T04:53:50.623Z",
		"size": 2711,
		"path": "../public/assets/AuthFields-CAYc-9Ns.js"
	},
	"/assets/AuthLayout-DtR1JOot.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"820-NsD3iDq/nn6oxuX1nkEj8bRbMCg\"",
		"mtime": "2026-10-10T04:53:50.625Z",
		"size": 2080,
		"path": "../public/assets/AuthLayout-DtR1JOot.js"
	},
	"/assets/award-BrLU41nX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112-BBdDYPY4NcLim7GLObgpU7bgFNY\"",
		"mtime": "2026-10-10T04:53:50.665Z",
		"size": 274,
		"path": "../public/assets/award-BrLU41nX.js"
	},
	"/assets/badge-check-DAiEEMXF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-RGetv2FYfsZM12vMd2Dg5V5RMbk\"",
		"mtime": "2026-10-10T04:53:50.667Z",
		"size": 316,
		"path": "../public/assets/badge-check-DAiEEMXF.js"
	},
	"/assets/bookmarks-D-b9Jh2H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"104d-UPmaKxqu0OrIyDK+O1ZAz7g0z0A\"",
		"mtime": "2026-10-10T04:53:50.668Z",
		"size": 4173,
		"path": "../public/assets/bookmarks-D-b9Jh2H.js"
	},
	"/assets/button-CGJJhG3Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b5-V/6z0KaW3NuhpjYVQvGCD37Ji5Y\"",
		"mtime": "2026-10-10T04:53:50.669Z",
		"size": 5045,
		"path": "../public/assets/button-CGJJhG3Z.js"
	},
	"/assets/chevron-up-CcCnbnfn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-r2fhfoedNJjp0NKI71QCfL6G+Gw\"",
		"mtime": "2026-10-10T04:53:50.672Z",
		"size": 128,
		"path": "../public/assets/chevron-up-CcCnbnfn.js"
	},
	"/assets/check-DO1r_eZj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7c-XaI+rXliOgIqEDRlRZoRgGbL3nc\"",
		"mtime": "2026-10-10T04:53:50.670Z",
		"size": 124,
		"path": "../public/assets/check-DO1r_eZj.js"
	},
	"/assets/circle-DQrQTGbB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf-ptXUEOyzUlIXmA1kya50JzvlAsw\"",
		"mtime": "2026-10-10T04:53:50.673Z",
		"size": 207,
		"path": "../public/assets/circle-DQrQTGbB.js"
	},
	"/assets/clsx-DB0hHKMi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"171-ECuaYbqpb4owKgP3JEL6PnaLhH4\"",
		"mtime": "2026-10-10T04:53:50.675Z",
		"size": 369,
		"path": "../public/assets/clsx-DB0hHKMi.js"
	},
	"/assets/coins-BZBQf_46.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d-vsqcvAzmMIYP+e8i924tYRUMpF0\"",
		"mtime": "2026-10-10T04:53:50.676Z",
		"size": 285,
		"path": "../public/assets/coins-BZBQf_46.js"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"3aee-Achds14k8G0bVzfW0qbWM6yMPLk\"",
		"mtime": "2026-10-10T04:36:50.616Z",
		"size": 15086,
		"path": "../public/favicon.ico"
	},
	"/apple-touch-icon.png": {
		"type": "image/png",
		"etag": "\"b627-S4S5es5dVdfwsWlIk0/XMDfkRxI\"",
		"mtime": "2026-10-10T04:36:50.636Z",
		"size": 46631,
		"path": "../public/apple-touch-icon.png"
	},
	"/assets/CommentSheet-CRsf7DiT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"293e-rno/Ib5sln39GvYh5J5i7vf1h20\"",
		"mtime": "2026-10-10T04:53:50.627Z",
		"size": 10558,
		"path": "../public/assets/CommentSheet-CRsf7DiT.js"
	},
	"/assets/dist-C_5Cls21.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1367-m1dnm9uFwIR2N2vfKQahDw+1AWU\"",
		"mtime": "2026-10-10T04:53:50.837Z",
		"size": 4967,
		"path": "../public/assets/dist-C_5Cls21.js"
	},
	"/assets/createLucideIcon-CRXPJZT_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2690-Zh9RpzGclFQ1PSKEAVCJ5gKu5gE\"",
		"mtime": "2026-10-10T04:53:50.678Z",
		"size": 9872,
		"path": "../public/assets/createLucideIcon-CRXPJZT_.js"
	},
	"/assets/dollar-sign-DLU8Q5gs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"db-CeGtoFjIK+CW0snvaDThqZyawV4\"",
		"mtime": "2026-10-10T04:53:50.841Z",
		"size": 219,
		"path": "../public/assets/dollar-sign-DLU8Q5gs.js"
	},
	"/assets/dist-mAxHwfE5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8cbe-Lbb4L+25MZgfYmNVs4gxaKhzqk8\"",
		"mtime": "2026-10-10T04:53:50.839Z",
		"size": 36030,
		"path": "../public/assets/dist-mAxHwfE5.js"
	},
	"/assets/ellipsis-vertical-O7dTDOem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"eb-Opm6mD1fhLcJpQIric5eBpWceUg\"",
		"mtime": "2026-10-10T04:53:50.842Z",
		"size": 235,
		"path": "../public/assets/ellipsis-vertical-O7dTDOem.js"
	},
	"/assets/eye-off-f4ZFWuWK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ae-7kwbHZuwFej0517ZCLY5az0wkJU\"",
		"mtime": "2026-10-10T04:53:50.843Z",
		"size": 430,
		"path": "../public/assets/eye-off-f4ZFWuWK.js"
	},
	"/assets/forgot-password-CjY_O38P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"866-BjTUBtETxoSErSe68keYABrk3XM\"",
		"mtime": "2026-10-10T04:53:50.844Z",
		"size": 2150,
		"path": "../public/assets/forgot-password-CjY_O38P.js"
	},
	"/assets/gift-C8ul8jHC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15d-0NCI7o9BPbl38hywHanUPxF6Rns\"",
		"mtime": "2026-10-10T04:53:50.887Z",
		"size": 349,
		"path": "../public/assets/gift-C8ul8jHC.js"
	},
	"/assets/grid-3x3-DUM6OXBI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-7Akd7k4a1s/bKvOuWhCqsp3OcCk\"",
		"mtime": "2026-10-10T04:53:50.887Z",
		"size": 295,
		"path": "../public/assets/grid-3x3-DUM6OXBI.js"
	},
	"/assets/history-zOxfTaPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed-vWf6qxxN3u5e/wv6Et1v8vUCJU0\"",
		"mtime": "2026-10-10T04:53:50.981Z",
		"size": 237,
		"path": "../public/assets/history-zOxfTaPw.js"
	},
	"/assets/interests-CgCWKY8i.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a00-b69E7wOWoFZAIdpoKoeuyrdHisQ\"",
		"mtime": "2026-10-10T04:53:50.985Z",
		"size": 2560,
		"path": "../public/assets/interests-CgCWKY8i.js"
	},
	"/assets/layers-CL6ypWH6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a5-Nn4kne/G4cbW+MHVbwyFnX1p0f8\"",
		"mtime": "2026-10-10T04:53:50.986Z",
		"size": 421,
		"path": "../public/assets/layers-CL6ypWH6.js"
	},
	"/assets/link-BrcUDEvw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c00-PNaVARg1phn7FsWq2SU6aHtInXA\"",
		"mtime": "2026-10-10T04:53:51.002Z",
		"size": 11264,
		"path": "../public/assets/link-BrcUDEvw.js"
	},
	"/assets/live-NKN6quD7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30a4-xzvfP0cI9IlFJ0xbf79RGuD8jPU\"",
		"mtime": "2026-10-10T04:53:51.003Z",
		"size": 12452,
		"path": "../public/assets/live-NKN6quD7.js"
	},
	"/assets/live._streamId-CKevvffz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6a6-VM8y6tnNCYd2ORSWBxiv1lOQn9A\"",
		"mtime": "2026-10-10T04:53:51.009Z",
		"size": 46758,
		"path": "../public/assets/live._streamId-CKevvffz.js"
	},
	"/assets/log-out-CkMwhfMs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b5-ppIV7Vd315fdjZcD53OheOGwLwE\"",
		"mtime": "2026-10-10T04:53:51.041Z",
		"size": 693,
		"path": "../public/assets/log-out-CkMwhfMs.js"
	},
	"/assets/login-DaTLO_py.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d58-cclJj6m/6kHUIGZpv9G6SQZ4qUA\"",
		"mtime": "2026-10-10T04:53:51.041Z",
		"size": 3416,
		"path": "../public/assets/login-DaTLO_py.js"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"1bcd3b-YNxEwdVItKEaK3cYNNT22I5W2Bk\"",
		"mtime": "2026-10-10T04:36:50.538Z",
		"size": 1822011,
		"path": "../public/favicon.svg"
	},
	"/assets/mail-UGl0-1Tr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d5-Xw+TPRCO7zB2oKU7NzJA7jhcDGI\"",
		"mtime": "2026-10-10T04:53:51.083Z",
		"size": 213,
		"path": "../public/assets/mail-UGl0-1Tr.js"
	},
	"/assets/live-room-xjIpslVF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8574b-oMNs61ICp4v4/nNqhcgMUnQB4iM\"",
		"mtime": "2026-10-10T04:53:51.004Z",
		"size": 546635,
		"path": "../public/assets/live-room-xjIpslVF.js"
	},
	"/assets/index-C8r_zlK4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103068-7z30nHnPs8jA71QvejDYTNRQ0z0\"",
		"mtime": "2026-10-10T04:53:50.619Z",
		"size": 1060968,
		"path": "../public/assets/index-C8r_zlK4.js"
	},
	"/assets/enable section-BMjT5lF0.png": {
		"type": "image/png",
		"etag": "\"19124a-CBKiIXf2PGFpMBNP4QwF7T9NZSk\"",
		"mtime": "2026-10-10T04:53:51.175Z",
		"size": 1643082,
		"path": "../public/assets/enable section-BMjT5lF0.png"
	},
	"/assets/Match-2sxbyZGR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11b8-KS1YeckWhtNmP+LOis1VVNlVtc0\"",
		"mtime": "2026-10-10T04:53:50.629Z",
		"size": 4536,
		"path": "../public/assets/Match-2sxbyZGR.js"
	},
	"/assets/notifications-BhJQjUQ1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1043-MjoX99hGl+6744ngNti1bXGDPG4\"",
		"mtime": "2026-10-10T04:53:51.086Z",
		"size": 4163,
		"path": "../public/assets/notifications-BhJQjUQ1.js"
	},
	"/assets/permissions-D70WSXvk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"43a-E2nUrFf4Kcum4xA6P1woWsppfdw\"",
		"mtime": "2026-10-10T04:53:51.087Z",
		"size": 1082,
		"path": "../public/assets/permissions-D70WSXvk.js"
	},
	"/assets/Heropage_image-D9IuWn3m.png": {
		"type": "image/png",
		"etag": "\"1d13b4-8MRP3LgT1Ap5mUUCmTGdWlhDYbk\"",
		"mtime": "2026-10-10T04:53:51.173Z",
		"size": 1905588,
		"path": "../public/assets/Heropage_image-D9IuWn3m.png"
	},
	"/assets/logo-DsDyB9Dx.png": {
		"type": "image/png",
		"etag": "\"1a26a2-DvE76b7lVXrUIU7yfr/0bbH0s4o\"",
		"mtime": "2026-10-10T04:53:51.178Z",
		"size": 1713826,
		"path": "../public/assets/logo-DsDyB9Dx.png"
	},
	"/assets/post._postId-CX_8Vf7U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5bd-7d3gtQz7NOGuPZSefNc9GoE8TAk\"",
		"mtime": "2026-10-10T04:53:51.088Z",
		"size": 1469,
		"path": "../public/assets/post._postId-CX_8Vf7U.js"
	},
	"/assets/PostSkeleton-BFaEKQvB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bb-PcbQKTlCiuLfnxk1CyFMkSl47UQ\"",
		"mtime": "2026-10-10T04:53:50.633Z",
		"size": 955,
		"path": "../public/assets/PostSkeleton-BFaEKQvB.js"
	},
	"/assets/PostCard-BBB2n34I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"43ad-i7YPu+f7egS+hS4+2TAllu39iA4\"",
		"mtime": "2026-10-10T04:53:50.631Z",
		"size": 17325,
		"path": "../public/assets/PostCard-BBB2n34I.js"
	},
	"/assets/progress-D0zPEZvn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d5-BuEMQyOpdNAkSumJxLTYHLsc2a4\"",
		"mtime": "2026-10-10T04:53:51.093Z",
		"size": 2261,
		"path": "../public/assets/progress-D0zPEZvn.js"
	},
	"/assets/preload-helper-B2fviOpp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"707-f98O4jEecX//GQnhmR1YV/4Md2w\"",
		"mtime": "2026-10-10T04:53:51.089Z",
		"size": 1799,
		"path": "../public/assets/preload-helper-B2fviOpp.js"
	},
	"/assets/profile._username-44xFulpg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"624e-ZRPeYaCPxMPeOKprQt6RTpMDBbA\"",
		"mtime": "2026-10-10T04:53:51.091Z",
		"size": 25166,
		"path": "../public/assets/profile._username-44xFulpg.js"
	},
	"/assets/QueryClientProvider-B--_wsv7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-VIsYXIIu3fCaZSZlzF75kxJoMEc\"",
		"mtime": "2026-10-10T04:53:50.636Z",
		"size": 385,
		"path": "../public/assets/QueryClientProvider-B--_wsv7.js"
	},
	"/assets/reels-BG47abO2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4918-Ki36iL4eT09uE4e3wTpjkJZkPEA\"",
		"mtime": "2026-10-10T04:53:51.095Z",
		"size": 18712,
		"path": "../public/assets/reels-BG47abO2.js"
	},
	"/assets/react-If_eLnS3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d85d-Or+WKtlhKCZGubNzXoiqwsadOzQ\"",
		"mtime": "2026-10-10T04:53:51.094Z",
		"size": 120925,
		"path": "../public/assets/react-If_eLnS3.js"
	},
	"/assets/reset-password-CYaw3YIJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd5-UzXuZLuIegGvl2b+svxn7IdlEig\"",
		"mtime": "2026-10-10T04:53:51.118Z",
		"size": 3029,
		"path": "../public/assets/reset-password-CYaw3YIJ.js"
	},
	"/assets/register-DzO0Q1LZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a1d-uXJTV+XhxTMjtPBhIEXQbd02b+0\"",
		"mtime": "2026-10-10T04:53:51.115Z",
		"size": 18973,
		"path": "../public/assets/register-DzO0Q1LZ.js"
	},
	"/assets/root-DLTE-HSj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20-vSYConOtSP6ciwr9zKsPixNwWmc\"",
		"mtime": "2026-10-10T04:53:51.119Z",
		"size": 32,
		"path": "../public/assets/root-DLTE-HSj.js"
	},
	"/assets/rotate-ccw-DVYC0OBA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c8-IJhMpaE41usle1pYHHDBPL071r8\"",
		"mtime": "2026-10-10T04:53:51.120Z",
		"size": 200,
		"path": "../public/assets/rotate-ccw-DVYC0OBA.js"
	},
	"/assets/routes-z3PzCzhn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"476d-1BoeukXcttMed4ivG83PxRscfMM\"",
		"mtime": "2026-10-10T04:53:51.122Z",
		"size": 18285,
		"path": "../public/assets/routes-z3PzCzhn.js"
	},
	"/assets/save-BeenomuE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"147-vCvnm7u8iWHspiB54YjuBs38oCA\"",
		"mtime": "2026-10-10T04:53:51.124Z",
		"size": 327,
		"path": "../public/assets/save-BeenomuE.js"
	},
	"/assets/shield-alert-Drr4xUaX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"161-Dqd7l7SgO8DmrqNgcqsaNwKsDU0\"",
		"mtime": "2026-10-10T04:53:51.125Z",
		"size": 353,
		"path": "../public/assets/shield-alert-Drr4xUaX.js"
	},
	"/assets/smartphone-C5IMF65B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-7VAoEbkTMeQ7oQOZ3/fjAJwJBQ8\"",
		"mtime": "2026-10-10T04:53:51.126Z",
		"size": 312,
		"path": "../public/assets/smartphone-C5IMF65B.js"
	},
	"/assets/SocialButtons-AaXP_bU-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"703-VuOx42dPMPiUmLsJT5MXy12gPoI\"",
		"mtime": "2026-10-10T04:53:50.637Z",
		"size": 1795,
		"path": "../public/assets/SocialButtons-AaXP_bU-.js"
	},
	"/assets/StaffUI-B2kUPP_v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab2-Tz3hlYSQTII5jFisvlb17zW+UXY\"",
		"mtime": "2026-10-10T04:53:50.637Z",
		"size": 2738,
		"path": "../public/assets/StaffUI-B2kUPP_v.js"
	},
	"/assets/studio-C-ccp9Bw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b76-A9bao/0hV6fIKgPLHNPhx0otLj0\"",
		"mtime": "2026-10-10T04:53:51.127Z",
		"size": 35702,
		"path": "../public/assets/studio-C-ccp9Bw.js"
	},
	"/assets/styleguide-DyLoS37l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b20-0X4DF/V5kfL4bXFlUSFihPN2nYw\"",
		"mtime": "2026-10-10T04:53:51.130Z",
		"size": 6944,
		"path": "../public/assets/styleguide-DyLoS37l.js"
	},
	"/assets/styles-BVLTwO6-.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"29581-J/VtDv8TCTGTYx4GSbv1oRF9NHM\"",
		"mtime": "2026-10-10T04:53:51.179Z",
		"size": 169345,
		"path": "../public/assets/styles-BVLTwO6-.css"
	},
	"/assets/system.dashboard-q4PmmB6X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"245c-C1PgV8OGzqiI94CdpW7Yy/8o8F0\"",
		"mtime": "2026-10-10T04:53:51.131Z",
		"size": 9308,
		"path": "../public/assets/system.dashboard-q4PmmB6X.js"
	},
	"/assets/system.dashboard.accounts-GGIhLunl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"220d-F9KuL1aiPmS5Z9aJd/V+9L6O2zE\"",
		"mtime": "2026-10-10T04:53:51.132Z",
		"size": 8717,
		"path": "../public/assets/system.dashboard.accounts-GGIhLunl.js"
	},
	"/assets/system.dashboard.achievements-RxWYkE5h.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1906-c3vMjnAGIyH9xdT7q5iTfJXssbA\"",
		"mtime": "2026-10-10T04:53:51.133Z",
		"size": 6406,
		"path": "../public/assets/system.dashboard.achievements-RxWYkE5h.js"
	},
	"/assets/system.dashboard.activity-B823JLx8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a36-viTLo1eWkD8TcPwrEg6Woknuttg\"",
		"mtime": "2026-10-10T04:53:51.136Z",
		"size": 2614,
		"path": "../public/assets/system.dashboard.activity-B823JLx8.js"
	},
	"/assets/system.dashboard.ad-settings-Boc7ZDKz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-/fa0nljIYJzQaXUhKMttjA8HxIQ\"",
		"mtime": "2026-10-10T04:53:51.137Z",
		"size": 8720,
		"path": "../public/assets/system.dashboard.ad-settings-Boc7ZDKz.js"
	},
	"/assets/system.dashboard.audit-lgfcRSKz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c50-TRCT6yFY9Yp16vhAqDVlZ/oZFIM\"",
		"mtime": "2026-10-10T04:53:51.138Z",
		"size": 3152,
		"path": "../public/assets/system.dashboard.audit-lgfcRSKz.js"
	},
	"/assets/system.dashboard.campaigns-DeW8U9Dz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2790-aS4Vsn9GfB0ojp0xapKPpev1iXo\"",
		"mtime": "2026-10-10T04:53:51.139Z",
		"size": 10128,
		"path": "../public/assets/system.dashboard.campaigns-DeW8U9Dz.js"
	},
	"/assets/system.dashboard.growth-CLrQdboU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cbe-jenVtEaXb6ZXAe/80JTU0e/g1VQ\"",
		"mtime": "2026-10-10T04:53:51.141Z",
		"size": 3262,
		"path": "../public/assets/system.dashboard.growth-CLrQdboU.js"
	},
	"/assets/system.dashboard.index-B9tjApBL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"de5-PPx1rdjkmtdHYgzJRBglbl2lOyU\"",
		"mtime": "2026-10-10T04:53:51.142Z",
		"size": 3557,
		"path": "../public/assets/system.dashboard.index-B9tjApBL.js"
	},
	"/assets/system.dashboard.live-DiYv47Yz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1802-5YQnSg2ZnEx2mgmBP87YpsYTT4Y\"",
		"mtime": "2026-10-10T04:53:51.143Z",
		"size": 6146,
		"path": "../public/assets/system.dashboard.live-DiYv47Yz.js"
	},
	"/assets/system.dashboard.moderation-BLs4h6EU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef8-da1LHuyjbYdko1ifqfb1X66slHM\"",
		"mtime": "2026-10-10T04:53:51.144Z",
		"size": 7928,
		"path": "../public/assets/system.dashboard.moderation-BLs4h6EU.js"
	},
	"/assets/system.dashboard.payments-CFnX9Mr8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ea8-IzLXJyRMVPpxJRQdiaf5GBScJbY\"",
		"mtime": "2026-10-10T04:53:51.146Z",
		"size": 3752,
		"path": "../public/assets/system.dashboard.payments-CFnX9Mr8.js"
	},
	"/assets/system.dashboard.rewards-DbCfTUBZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6a-Fu+LAkvAHovQHmP838izhAK3miI\"",
		"mtime": "2026-10-10T04:53:51.147Z",
		"size": 3178,
		"path": "../public/assets/system.dashboard.rewards-DbCfTUBZ.js"
	},
	"/assets/system.dashboard.settings-BJABwlXI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1410-wWH8URnx3DVesFmkCHxhVU4ytBY\"",
		"mtime": "2026-10-10T04:53:51.148Z",
		"size": 5136,
		"path": "../public/assets/system.dashboard.settings-BJABwlXI.js"
	},
	"/assets/system.dashboard.staff-zA-66ys_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1004-65Tg2mU91cD8KIiwoslPRiSFHao\"",
		"mtime": "2026-10-10T04:53:51.150Z",
		"size": 4100,
		"path": "../public/assets/system.dashboard.staff-zA-66ys_.js"
	},
	"/assets/system.index-3gii9DG7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12ff-qq/MUD2g7L6YN/dryQdacIeThtU\"",
		"mtime": "2026-10-10T04:53:51.151Z",
		"size": 4863,
		"path": "../public/assets/system.index-3gii9DG7.js"
	},
	"/assets/tag._tag-DL26CZav.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b1e-uYnuMxeGjSM1Hhjm2WwNejsWBok\"",
		"mtime": "2026-10-10T04:53:51.153Z",
		"size": 2846,
		"path": "../public/assets/tag._tag-DL26CZav.js"
	},
	"/assets/target-CT4UV5D8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-NhmS4lv/LOpuf3pgfuSByvv0jGM\"",
		"mtime": "2026-10-10T04:53:51.154Z",
		"size": 226,
		"path": "../public/assets/target-CT4UV5D8.js"
	},
	"/assets/use-ads-bqzZ-KQN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fa6-efuFwwm2hiGu75COlvALLD3XxOg\"",
		"mtime": "2026-10-10T04:53:51.155Z",
		"size": 4006,
		"path": "../public/assets/use-ads-bqzZ-KQN.js"
	},
	"/assets/use-staff-finance-Cl3gjThp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d9-dVLn0pmrk6IVTjDN5G0CYH1NTpg\"",
		"mtime": "2026-10-10T04:53:51.156Z",
		"size": 985,
		"path": "../public/assets/use-staff-finance-Cl3gjThp.js"
	},
	"/assets/use-staff-management-Cma1G1yD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b0-JXaJFLhwCMKYmr3KcwCJcHPMMHc\"",
		"mtime": "2026-10-10T04:53:51.157Z",
		"size": 1968,
		"path": "../public/assets/use-staff-management-Cma1G1yD.js"
	},
	"/assets/use-staff-notifications-CxH7qLl-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ab-ywKclyUR10se8ZvlYkeQd+P3yFY\"",
		"mtime": "2026-10-10T04:53:51.158Z",
		"size": 1451,
		"path": "../public/assets/use-staff-notifications-CxH7qLl-.js"
	},
	"/assets/use-wallet-CowcW5Zx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b4-Iz4ni8cWFCQPWoRwGLXY7Sra7fw\"",
		"mtime": "2026-10-10T04:53:51.159Z",
		"size": 948,
		"path": "../public/assets/use-wallet-CowcW5Zx.js"
	},
	"/assets/useMatch-CgkzJcZK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"275-QfEKuSAaw3xEWfhvSWQsUvm57gY\"",
		"mtime": "2026-10-10T04:53:51.160Z",
		"size": 629,
		"path": "../public/assets/useMatch-CgkzJcZK.js"
	},
	"/assets/useMutation-Cd9_IpKh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15ed-4G6nHna23OySxt80o9ZnGR1SMUs\"",
		"mtime": "2026-10-10T04:53:51.161Z",
		"size": 5613,
		"path": "../public/assets/useMutation-Cd9_IpKh.js"
	},
	"/assets/useQuery-B76QBTbu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5c86-77OK5Z3hzpYzzvnwDS7Uo7TISQc\"",
		"mtime": "2026-10-10T04:53:51.163Z",
		"size": 23686,
		"path": "../public/assets/useQuery-B76QBTbu.js"
	},
	"/assets/useRouter-kUxBpUuj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9c-mvV9nNWOnm6PvQp2JVa5fHF7JsE\"",
		"mtime": "2026-10-10T04:53:51.164Z",
		"size": 156,
		"path": "../public/assets/useRouter-kUxBpUuj.js"
	},
	"/assets/useNavigate-sAfHcBjl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e9-GGGbBCV7aN1DUK70e36TG/xuTxM\"",
		"mtime": "2026-10-10T04:53:51.161Z",
		"size": 233,
		"path": "../public/assets/useNavigate-sAfHcBjl.js"
	},
	"/assets/verify-BDQy4GXC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca3-R3Ci1k44wZMuvPGmqYCAxoX9WaI\"",
		"mtime": "2026-10-10T04:53:51.167Z",
		"size": 3235,
		"path": "../public/assets/verify-BDQy4GXC.js"
	},
	"/assets/utils-BWfyOJOq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6936-JN3ZY6ohfWfPHA2u8SMsyZt/17A\"",
		"mtime": "2026-10-10T04:53:51.166Z",
		"size": 26934,
		"path": "../public/assets/utils-BWfyOJOq.js"
	},
	"/assets/volume-x-BCPdQ7Fi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d7-yGGLP4pL3y4XwHHs/MLRcRv16Qw\"",
		"mtime": "2026-10-10T04:53:51.168Z",
		"size": 727,
		"path": "../public/assets/volume-x-BCPdQ7Fi.js"
	},
	"/assets/wallet-DX9c1M7W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bfe-HqLxQiTA/SGPvijPgcNNWLpwjMw\"",
		"mtime": "2026-10-10T04:53:51.169Z",
		"size": 7166,
		"path": "../public/assets/wallet-DX9c1M7W.js"
	},
	"/assets/x-JLYjteJy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-ksvN0TfXMdPifXk+ucGMD6yK5PM\"",
		"mtime": "2026-10-10T04:53:51.171Z",
		"size": 154,
		"path": "../public/assets/x-JLYjteJy.js"
	},
	"/assets/welcome-D1i0QJt-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4a-6TwenS5YFdb0X8U/9GSd8ZZzQRA\"",
		"mtime": "2026-10-10T04:53:51.170Z",
		"size": 3914,
		"path": "../public/assets/welcome-D1i0QJt-.js"
	},
	"/assets/_-D_1nxgLz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49f-YdhR2vzNBT5QCjHZeP0ah6gjURM\"",
		"mtime": "2026-10-10T04:53:50.656Z",
		"size": 1183,
		"path": "../public/assets/_-D_1nxgLz.js"
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
