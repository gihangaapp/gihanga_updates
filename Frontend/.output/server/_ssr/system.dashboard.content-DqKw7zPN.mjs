import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { In as CircleCheck, J as ShieldCheck, O as Trash2, an as Funnel, ar as ArrowRight, cr as Archive, ct as RefreshCw, d as Video, nt as Search, or as ArrowLeft, ot as RotateCcw, qt as Image, un as FileText } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl } from "./api-client-C-W0Sa9i.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
import { E as formatCount, Jt as DialogDescription, Kt as Dialog, N as timeAgo, Xt as DialogHeader, Zt as DialogTitle, qt as DialogContent } from "./router-BDN0UH9I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { o as hasPermission } from "./permissions-Bg62BCbG.mjs";
import { a as AdminEmptyState, c as AdminSearchInput, d as AdminStatCard, l as AdminSegmented, n as AdminBadge, o as AdminErrorState, r as AdminCard, s as AdminPageHeader, t as AdminAvatar, u as AdminSkeletonRows } from "./AdminUI-Cf1j1IrP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.content-DqKw7zPN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var statusTone = {
	published: "success",
	scheduled: "info",
	draft: "muted",
	processing: "warning",
	rejected: "danger",
	removed: "danger"
};
function ContentManagementPage() {
	const { staffUser } = useAuth();
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [kind, setKind] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [removalTarget, setRemovalTarget] = (0, import_react.useState)(null);
	const [reason, setReason] = (0, import_react.useState)("");
	const canView = hasPermission(staffUser, "content.view");
	const canRemove = hasPermission(staffUser, "content.remove");
	const canRestore = hasPermission(staffUser, "content.restore");
	const queryString = (0, import_react.useMemo)(() => {
		const params = new URLSearchParams({
			page: String(page),
			limit: "20",
			status,
			kind
		});
		if (search) params.set("q", search);
		return params.toString();
	}, [
		page,
		status,
		kind,
		search
	]);
	const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
		queryKey: [
			"staff",
			"content",
			page,
			status,
			kind,
			search
		],
		queryFn: () => api.get(`/system/content?${queryString}`, true),
		enabled: canView,
		placeholderData: (previous) => previous
	});
	const removeMutation = useMutation({
		mutationFn: (input) => api.post(`/system/content/${input.id}/remove`, { reason: input.reason }, true),
		onSuccess: async () => {
			toast.success("Content removed", { description: "The post is hidden from public feeds and its record is preserved." });
			setRemovalTarget(null);
			setReason("");
			await queryClient.invalidateQueries({ queryKey: ["staff", "content"] });
			await queryClient.invalidateQueries({ queryKey: ["staff", "overview"] });
		},
		onError: (err) => toast.error(err.message || "Unable to remove content")
	});
	const restoreMutation = useMutation({
		mutationFn: (id) => api.post(`/system/content/${id}/restore`, void 0, true),
		onSuccess: async () => {
			toast.success("Content restored", { description: "The previous content status has been restored." });
			await queryClient.invalidateQueries({ queryKey: ["staff", "content"] });
			await queryClient.invalidateQueries({ queryKey: ["staff", "overview"] });
		},
		onError: (err) => toast.error(err.message || "Unable to restore content")
	});
	const counts = data?.statusCounts ?? {};
	const posts = data?.posts ?? [];
	const statusOptions = [
		{
			id: "all",
			label: "All content",
			count: Object.values(counts).reduce((sum, value) => sum + value, 0)
		},
		{
			id: "published",
			label: "Published",
			count: counts.published ?? 0
		},
		{
			id: "scheduled",
			label: "Scheduled",
			count: counts.scheduled ?? 0
		},
		{
			id: "draft",
			label: "Drafts",
			count: counts.draft ?? 0
		},
		{
			id: "processing",
			label: "Processing",
			count: counts.processing ?? 0
		},
		{
			id: "rejected",
			label: "Rejected",
			count: counts.rejected ?? 0
		},
		{
			id: "removed",
			label: "Removed",
			count: counts.removed ?? 0
		}
	];
	if (!canView) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
			icon: Archive,
			title: "Content Management",
			description: "Search and manage platform posts.",
			accent: "primary"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
			icon: ShieldCheck,
			title: "Permission required",
			description: "The Content Management Center is available to Admins and Super Admins."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: Archive,
				title: "Content Management",
				description: "Search platform posts, inspect engagement, remove policy-violating content and restore decisions when appropriate.",
				accent: "aqua",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "border-border",
					onClick: () => refetch(),
					disabled: isFetching,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${isFetching ? "animate-spin" : ""}` }), " Refresh"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 xl:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: FileText,
						label: "All posts",
						value: formatCount(statusOptions[0].count ?? 0),
						tone: "primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: CircleCheck,
						label: "Published",
						value: formatCount(counts.published ?? 0),
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: RefreshCw,
						label: "Processing",
						value: formatCount(counts.processing ?? 0),
						tone: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: ShieldCheck,
						label: "Rejected",
						value: formatCount(counts.rejected ?? 0),
						tone: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Trash2,
						label: "Removed",
						value: formatCount(counts.removed ?? 0),
						tone: "muted"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSearchInput, {
						value: searchInput,
						onChange: (value) => setSearchInput(value),
						placeholder: "Search captions, hashtags or creator…",
						className: "w-full xl:max-w-md"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-10 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: kind,
								onChange: (event) => {
									setKind(event.target.value);
									setPage(1);
								},
								className: "bg-transparent text-foreground outline-none",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "All types"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "photo",
										children: "Photos"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "video",
										children: "Videos"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "reel",
										children: "Deeds"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "text",
										children: "Text"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "brand",
							className: "h-10",
							onClick: () => {
								setSearch(searchInput.trim());
								setPage(1);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Search"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
						size: "sm",
						options: statusOptions,
						value: status,
						onChange: (next) => {
							setStatus(next);
							setPage(1);
						}
					})
				})]
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 5 }),
			isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminErrorState, {
				message: error instanceof Error ? error.message : "Unable to load content",
				onRetry: () => refetch()
			}),
			!isLoading && !isError && posts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
				icon: Archive,
				title: "No content found",
				description: "Try another search term or adjust the content filters."
			}),
			!isLoading && !isError && posts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-semibold text-muted-foreground",
							children: [
								formatCount(data?.total ?? 0),
								" results · Page ",
								data?.page ?? page
							]
						}), isFetching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium text-primary",
							children: "Updating…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3",
						children: posts.map((post, index) => {
							const preview = mediaUrl(post.thumbnailUrl || post.mediaUrl);
							const canTakeAction = post.status !== "removed" && canRemove;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									opacity: 0,
									y: 8
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: { delay: Math.min(index * .025, .2) },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCard, {
									className: "overflow-hidden p-4 sm:p-5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-4 md:flex-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-muted md:w-36",
												children: [preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: preview,
													alt: "Content preview",
													loading: "lazy",
													className: "h-full w-full object-cover"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "grid h-full w-full place-items-center text-muted-foreground",
													children: post.kind === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-7" }) : post.kind === "video" || post.kind === "reel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-7" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-7" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold capitalize text-white",
													children: post.kind
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-wrap items-center gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
																tone: statusTone[post.status] ?? "muted",
																dot: true,
																children: post.status.replaceAll("_", " ")
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
																tone: "muted",
																children: post.audience
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-[11px] text-muted-foreground",
																children: [timeAgo(post.createdAt), " ago"]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm font-semibold text-foreground",
														children: post.body || "No caption provided"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "inline-flex items-center gap-1.5",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
																		name: post.author?.name || "Unknown creator",
																		hue: post.author?.avatarHue ?? 205,
																		size: "sm"
																	}),
																	post.author?.name || "Unknown creator",
																	" ",
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-muted-foreground/70",
																		children: ["@", post.author?.username || "unknown"]
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["♥ ", formatCount(post.likesCount)] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Comments ", formatCount(post.commentsCount)] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Views ", formatCount(post.viewsCount)] })
														]
													}),
													post.status === "removed" && post.removedReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "mt-3 rounded-lg border border-danger/15 bg-danger/5 px-3 py-2 text-[11px] text-danger",
														children: ["Removal reason: ", post.removedReason]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex shrink-0 items-center gap-2 md:flex-col md:items-end md:justify-center",
												children: [canTakeAction && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "destructive",
													onClick: () => {
														setRemovalTarget(post);
														setReason("");
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Remove"]
												}), post.status === "removed" && canRestore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "border-success/30 text-success hover:bg-success/10",
													onClick: () => restoreMutation.mutate(post._id),
													disabled: restoreMutation.isPending,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), " Restore"]
												})]
											})
										]
									})
								})
							}, post._id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: page <= 1 || isFetching,
								onClick: () => setPage((value) => Math.max(1, value - 1)),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), " Previous"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: ["Page ", data?.page ?? page]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: !data?.hasMore || isFetching,
								onClick: () => setPage((value) => value + 1),
								children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(removalTarget),
				onOpenChange: (open) => {
					if (!open) {
						setRemovalTarget(null);
						setReason("");
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Remove this content?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This post will be hidden from public feeds. Its record and previous status will be preserved so the decision can be audited and reversed." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-muted/40 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-2 text-sm font-medium text-foreground",
									children: removalTarget?.body || "No caption provided"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[11px] text-muted-foreground",
									children: ["By @", removalTarget?.author?.username || "unknown"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-semibold text-foreground",
								htmlFor: "content-removal-reason",
								children: "Reason for removal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "content-removal-reason",
								value: reason,
								onChange: (event) => setReason(event.target.value),
								maxLength: 500,
								rows: 3,
								placeholder: "Explain which community guideline this content violates…",
								className: "w-full resize-y rounded-xl border border-border bg-elevated px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => {
										setRemovalTarget(null);
										setReason("");
									},
									disabled: removeMutation.isPending,
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "destructive",
									disabled: !removalTarget || reason.trim().length < 3 || removeMutation.isPending,
									onClick: () => removalTarget && removeMutation.mutate({
										id: removalTarget._id,
										reason: reason.trim()
									}),
									children: removeMutation.isPending ? "Removing…" : "Confirm removal"
								})]
							})
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { ContentManagementPage as component };
