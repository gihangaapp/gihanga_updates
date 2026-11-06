import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { In as CircleCheck, Ln as CircleCheckBig, O as Trash2, P as Target, Ut as Layers, ar as ArrowRight, c as Wallet, dn as Eye, dt as Play, gt as Pause, kn as Clock, or as ArrowLeft, qt as Image, ut as Plus, wt as MonitorPlay, x as Upload, xt as MousePointerClick, z as Sparkles, zt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { d as uploadFile, s as mediaUrl } from "./api-client-C-W0Sa9i.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
import { E as formatCount, Kt as Dialog, S as RwandaPhoneInput, Xt as DialogHeader, Zt as DialogTitle, k as normalizeRwandaPhone, qt as DialogContent, t as AppShell } from "./router-BDN0UH9I.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AdBadge } from "./AdBadge-CcJQZFFu.mjs";
import { D as useUpdateAd, c as useCreateAd, f as useMyAds, n as useAdConfig, o as useCalculateAdPrice, u as useDeleteAd } from "./use-ads-Bg4PdVDV.mjs";
import { t as AdPreview } from "./AdPreview-BDGYy0QI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ads-CNZnN20_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_STYLE = {
	draft: "bg-muted text-muted-foreground",
	pending_payment: "bg-amber-500/15 text-amber-600",
	processing: "bg-amber-500/15 text-amber-600",
	paid: "bg-indigo-500/15 text-indigo-500",
	pending_review: "bg-amber-500/15 text-amber-600",
	approved: "bg-sky-500/15 text-sky-600",
	active: "bg-success/15 text-success font-extrabold",
	paused: "bg-muted text-muted-foreground",
	expired: "bg-primary-soft text-primary",
	rejected: "bg-danger/15 text-danger",
	cancelled: "bg-muted text-muted-foreground line-through",
	refund_pending: "bg-amber-500/15 text-amber-600",
	refunded: "bg-muted text-muted-foreground"
};
function AdCard({ campaign }) {
	const [previewOpen, setPreviewOpen] = (0, import_react.useState)(false);
	const updateAd = useUpdateAd();
	const deleteAd = useDeleteAd();
	const deliveryProgress = campaign.advertisingMinutes > 0 ? Math.min(100, campaign.advertisingMinutesDelivered / campaign.advertisingMinutes * 100) : 0;
	const isManualPayment = campaign.paymentMethod === "manual";
	const reviewLabel = campaign.status === "pending_review" ? "Awaiting creative review" : campaign.status === "approved" && campaign.manualPaymentStatus !== "verified" ? "Creative approved · Awaiting manual payment" : campaign.status === "active" ? "Payment verified · Campaign delivering" : campaign.status.replaceAll("_", " ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card overflow-hidden border border-border p-4 transition-all hover:border-border/80",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate font-bold text-sm text-foreground",
							children: campaign.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBadge, { variant: "glass" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-xs text-muted-foreground capitalize",
						children: [
							campaign.adType.replace("_", " "),
							" · ",
							campaign.placement,
							" placement"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("shrink-0 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", STATUS_STYLE[campaign.status]),
					children: campaign.status.replaceAll("_", " ")
				})]
			}),
			campaign.status === "rejected" && campaign.rejectionReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-bold",
					children: "Rejection reason:"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5",
					children: campaign.rejectionReason
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-elevated p-3 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [campaign.paymentStatus === "paid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-foreground",
						children: isManualPayment ? `Manual payment · ${reviewLabel}` : `Payment · ${campaign.paymentStatus.replaceAll("_", " ")}`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: !isManualPayment ? "This campaign uses the original payment record." : campaign.status === "pending_review" ? "Payment is arranged only after the creative is approved." : campaign.status === "approved" ? "Our team will contact you using the submitted details to arrange payment." : campaign.status === "rejected" ? "No payment is due for a rejected campaign." : campaign.status === "active" ? "Your manual payment was confirmed and the campaign is delivering." : "Our team will use the submitted details for campaign follow-up."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-extrabold tabular-nums text-foreground",
					children: [campaign.totalRwfCost.toLocaleString(), " RWF"]
				})]
			}),
			isManualPayment && campaign.manualPaymentContact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 rounded-lg border border-border/60 p-2.5 text-[11px] text-muted-foreground",
				children: [
					"Payment contact: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: campaign.manualPaymentContact.email
					}),
					" · ",
					campaign.manualPaymentContact.phone
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3.5 grid grid-cols-4 gap-1.5 rounded-xl border border-border/60 bg-card p-2 text-center text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center justify-center gap-1 font-extrabold text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3 text-primary" }),
							" ",
							formatCount(campaign.analytics?.impressions ?? 0)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "Impressions"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center justify-center gap-1 font-extrabold text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointerClick, { className: "size-3 text-primary" }),
							" ",
							formatCount(campaign.analytics?.clicks ?? 0)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "Clicks"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-extrabold text-foreground",
						children: [campaign.analytics?.ctr ?? 0, "%"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "CTR"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-extrabold text-foreground",
						children: formatCount(campaign.analytics?.views ?? 0)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "Views"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex justify-between text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Delivery quota: ",
						campaign.advertisingMinutesDelivered,
						" / ",
						campaign.advertisingMinutes,
						" min"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-bold text-foreground",
						children: [Math.round(deliveryProgress), "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-2 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gradient-brand h-full transition-all duration-300",
						style: { width: `${deliveryProgress}%` }
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setPreviewOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "mr-1 size-3.5" }), " Preview"]
					}),
					(campaign.status === "active" || campaign.status === "paused") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "flex-1",
						disabled: updateAd.isPending,
						onClick: () => updateAd.mutate({
							id: campaign._id,
							status: campaign.status === "active" ? "paused" : "active"
						}),
						children: [campaign.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "mr-1 size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-1 size-3.5" }), campaign.status === "active" ? "Pause" : "Resume"]
					}),
					(campaign.paymentStatus !== "paid" || campaign.status === "rejected" || campaign.status === "draft") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "text-danger hover:bg-danger/10",
						disabled: deleteAd.isPending,
						onClick: () => deleteAd.mutate(campaign._id, {
							onSuccess: () => toast.success("Campaign removed"),
							onError: (error) => toast.error(error.message || "Could not remove campaign")
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: previewOpen,
				onOpenChange: setPreviewOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Advertisement Preview — ", campaign.title] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
							adType: campaign.adType,
							placement: campaign.placement,
							title: campaign.title,
							caption: campaign.caption,
							ctaText: campaign.ctaText,
							ctaUrl: campaign.ctaUrl,
							mediaUrl: campaign.mediaUrl,
							mediaKey: campaign.mediaKey,
							thumbnailUrl: campaign.thumbnailUrl,
							creatorName: typeof campaign.creator === "object" ? campaign.creator.name : void 0,
							creatorUsername: typeof campaign.creator === "object" ? campaign.creator.username : void 0,
							creatorAvatarUrl: typeof campaign.creator === "object" ? campaign.creator.avatarUrl : void 0,
							creatorAvatarHue: typeof campaign.creator === "object" ? campaign.creator.avatarHue : void 0
						})
					})]
				})
			})
		]
	});
}
function AdWizard({ open, onOpenChange, onCreated }) {
	const { data: config } = useAdConfig();
	const { user } = useAuth();
	const createAd = useCreateAd();
	const [step, setStep] = (0, import_react.useState)(1);
	const [adType, setAdType] = (0, import_react.useState)("image");
	const [placement, setPlacement] = (0, import_react.useState)("feed");
	const [title, setTitle] = (0, import_react.useState)("");
	const [caption, setCaption] = (0, import_react.useState)("");
	const [ctaText, setCtaText] = (0, import_react.useState)("Learn More");
	const [ctaUrl, setCtaUrl] = (0, import_react.useState)("");
	const [mediaUrl$1, setMediaUrl] = (0, import_react.useState)("");
	const [mediaKey, setMediaKey] = (0, import_react.useState)("");
	const [uploadedMediaType, setUploadedMediaType] = (0, import_react.useState)("image");
	const [thumbnailUrl, setThumbnailUrl] = (0, import_react.useState)("");
	const [videoDurationSeconds, setVideoDurationSeconds] = (0, import_react.useState)(void 0);
	const [isUploading, setIsUploading] = (0, import_react.useState)(false);
	const [campaignDurationDays, setCampaignDurationDays] = (0, import_react.useState)(7);
	const [advertisingMinutes, setAdvertisingMinutes] = (0, import_react.useState)(10);
	const [contactName, setContactName] = (0, import_react.useState)("");
	const [contactEmail, setContactEmail] = (0, import_react.useState)("");
	const [contactPhone, setContactPhone] = (0, import_react.useState)("");
	const [targetInterests, setTargetInterests] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!user) return;
		setContactName((current) => current || user.name || "");
		setContactEmail((current) => current || user.email || "");
	}, [user]);
	const { data: priceData, isLoading: priceLoading } = useCalculateAdPrice(advertisingMinutes, campaignDurationDays);
	function handleFileUpload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const isVideo = file.type.toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|3gp)$/i.test(file.name);
		const kind = isVideo ? "videos" : "photos";
		setMediaUrl("");
		setMediaKey("");
		setThumbnailUrl("");
		setVideoDurationSeconds(void 0);
		setUploadedMediaType(isVideo ? "video" : "image");
		if (isVideo) setAdType(placement === "story" ? "story_video" : "video");
		else setAdType(placement === "story" ? "story_image" : "image");
		setIsUploading(true);
		uploadFile(kind, file).then((res) => {
			const absoluteUrl = mediaUrl(res.url) || res.url;
			setMediaUrl(absoluteUrl);
			setMediaKey(res.mediaId || res.key || "");
			setThumbnailUrl(res.thumbnailUrl ? mediaUrl(res.thumbnailUrl) || res.thumbnailUrl : "");
			setVideoDurationSeconds(void 0);
			if (isVideo) {
				const probeUrl = URL.createObjectURL(file);
				const probe = document.createElement("video");
				probe.preload = "metadata";
				probe.onloadedmetadata = () => {
					if (Number.isFinite(probe.duration) && probe.duration > 0) setVideoDurationSeconds(Math.round(probe.duration));
					URL.revokeObjectURL(probeUrl);
				};
				probe.onerror = () => URL.revokeObjectURL(probeUrl);
				probe.src = probeUrl;
			}
			toast.success("Media uploaded successfully!");
		}).catch((err) => {
			toast.error(err.message || "Failed to upload media");
		}).finally(() => setIsUploading(false));
	}
	function handleCreateDraft() {
		if (!title.trim()) {
			toast.error("Please enter a title for your campaign");
			return;
		}
		if (!mediaUrl$1) {
			toast.error("Please upload an image or video for your advertisement");
			return;
		}
		if (!contactName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
			toast.error("Enter the contact name and a valid email address");
			return;
		}
		let normalizedContactPhone;
		try {
			normalizedContactPhone = normalizeRwandaPhone(contactPhone);
		} catch {
			toast.error("Enter a valid Rwanda number, for example +250 788 123 456");
			return;
		}
		createAd.mutate({
			adType,
			placement,
			title: title.trim(),
			caption: caption.trim() || void 0,
			ctaText: ctaText.trim() || "Learn More",
			ctaUrl: ctaUrl.trim() || void 0,
			mediaUrl: mediaUrl$1 || void 0,
			mediaKey: mediaKey || void 0,
			mediaType: adType.includes("video") ? "video" : "image",
			videoDurationSeconds,
			thumbnailUrl: thumbnailUrl || void 0,
			campaignDurationDays,
			advertisingMinutes,
			contactName: contactName.trim(),
			contactEmail: contactEmail.trim(),
			contactPhone: normalizedContactPhone,
			targeting: { interests: targetInterests.split(",").map((interest) => interest.trim()).filter(Boolean) }
		}, {
			onSuccess: (data) => {
				toast.success("Campaign submitted for review!");
				onCreated?.(data.campaign);
				onOpenChange(false);
			},
			onError: (err) => {
				toast.error(err.message || "Failed to create campaign");
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-[760px] p-0 gap-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "p-6 pb-4 border-b border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2 font-display text-xl font-extrabold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-amber-500" }), "Advertise on Gihanga Updates"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1 text-xs font-bold text-muted-foreground",
						children: [
							"Step ",
							step,
							" of 4"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-primary transition-all duration-300",
						style: { width: `${step / 4 * 100}%` }
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-bold text-foreground",
									children: "1. Choose Content & Media"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Ad Title *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: title,
									onChange: (e) => setTitle(e.target.value),
									placeholder: "e.g., New Summer Collection Launch"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Caption / Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: caption,
									onChange: (e) => setCaption(e.target.value),
									rows: 3,
									placeholder: "Write a brief description that engages your target audience...",
									className: "w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground outline-none focus:border-primary"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-xs font-semibold text-muted-foreground",
										children: "Button Text"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: ctaText,
										onChange: (e) => setCtaText(e.target.value),
										placeholder: "Learn More"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-xs font-semibold text-muted-foreground",
										children: "Destination Link URL"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: ctaUrl,
										onChange: (e) => setCtaUrl(e.target.value),
										placeholder: "https://..."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Upload Image or Video"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 hover:bg-muted/60 transition-colors",
									children: [isUploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs text-muted-foreground font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), " Uploading media to server..."]
									}) : mediaUrl$1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-center text-xs text-success font-semibold flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-4" }), " Media attached! Click to change."]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-center gap-1 text-center text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-5 text-primary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: "Click to upload media"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Supports JPG, PNG, MP4, MOV (Max video length:",
												" ",
												config?.maxVideoDurationSeconds ?? 120,
												"s)"
											] })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*,video/*",
										onChange: handleFileUpload,
										className: "hidden"
									})]
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-3 text-sm font-bold text-foreground",
							children: "Live Ad Preview"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
							adType,
							placement,
							title: title || "Your Campaign Title",
							caption,
							ctaText,
							ctaUrl,
							mediaUrl: mediaUrl$1,
							mediaKey,
							thumbnailUrl,
							creatorName: user?.name,
							creatorUsername: user?.username,
							creatorAvatarUrl: user?.avatarUrl || void 0,
							creatorAvatarHue: user?.avatarHue
						})] })]
					}),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-bold text-foreground",
								children: "2. Select Where Your Ad Will Appear"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setPlacement("feed");
											setAdType(uploadedMediaType);
										},
										className: cn("flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all", placement === "feed" ? "border-primary bg-primary-soft/30 shadow-md ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/40"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5" })
											}), placement === "feed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-5 text-primary" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-bold text-sm text-foreground",
											children: "In-Feed Advertisement"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: "Appears between organic posts in eligible users' home feeds, clearly marked Sponsored."
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setPlacement("reels");
											setAdType(uploadedMediaType);
										},
										className: cn("flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all", placement === "reels" ? "border-primary bg-primary-soft/30 shadow-md ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/40"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-500",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5" })
											}), placement === "reels" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-5 text-primary" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-bold text-sm text-foreground",
											children: "Deeds Advertisement"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: "Appears as a vertical sponsored slide between organic Deeds, with video or image creative and a CTA."
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setPlacement("story");
											setAdType(uploadedMediaType === "video" ? "story_video" : "story_image");
										},
										className: cn("flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all", placement === "story" ? "border-primary bg-primary-soft/30 shadow-md ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/40"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-5" })
											}), placement === "story" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-5 text-primary" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-bold text-sm text-foreground",
											children: "Decision Advertisement"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: "Delivered full-screen between organic Decisions with an interactive call to action."
										})] })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-2xl border border-border bg-muted/20 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "mb-3 text-xs font-bold text-muted-foreground",
									children: [
										"Placement Preview (",
										placement.toUpperCase(),
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
									adType,
									placement,
									title: title || "Your Campaign Title",
									caption,
									ctaText,
									ctaUrl,
									mediaUrl: mediaUrl$1,
									mediaKey,
									thumbnailUrl,
									creatorName: user?.name,
									creatorUsername: user?.username,
									creatorAvatarUrl: user?.avatarUrl || void 0,
									creatorAvatarHue: user?.avatarHue
								})]
							})
						]
					}),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold text-foreground",
							children: "3. Duration & Advertising Minutes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
											children: "Advertising Minutes (Quota Purchased)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: config?.minMinutes ?? 1,
											max: config?.maxMinutes ?? 180,
											value: advertisingMinutes,
											onChange: (e) => setAdvertisingMinutes(Number(e.target.value))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-muted-foreground",
											children: "1 advertising minute = 60 seconds of total active user view time delivered to your target audience."
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
											children: "Campaign Duration (Calendar Days)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: config?.minCampaignDays ?? 1,
											max: config?.maxCampaignDays ?? 30,
											value: campaignDurationDays,
											onChange: (e) => setCampaignDurationDays(Number(e.target.value))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-muted-foreground",
											children: "The campaign will run over this period until your advertising minutes quota is fulfilled."
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
											children: "Audience interests (optional)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: targetInterests,
											onChange: (e) => setTargetInterests(e.target.value),
											placeholder: "e.g. fashion, technology, education"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-muted-foreground",
											children: "Separate interests with commas. Leave empty to reach all eligible users."
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-2 block text-xs font-bold text-foreground",
										children: "Quick Packages"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											10,
											30,
											60
										].map((mins) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setAdvertisingMinutes(mins),
											className: cn("rounded-xl border p-2.5 text-center text-xs font-bold transition-all", advertisingMinutes === mins ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-muted"),
											children: [mins, " Minutes"]
										}, mins))
									})] })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "font-bold text-sm text-foreground flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-primary" }), " Cost Summary & Rates"]
								}), priceLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-center py-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-primary" })
								}) : priceData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 text-xs",
									children: [priceData.breakdown.filter((item) => !item.line.toLowerCase().includes("points") && !item.line.toLowerCase().includes("gp")).map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between border-b border-border/40 pb-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: [item.line, ":"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: item.value
										})]
									}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 rounded-xl bg-primary-soft/40 p-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground block font-bold",
												children: "Estimated campaign fee (manual payment)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display font-extrabold text-lg text-primary",
												children: [priceData.rwfTotal.toLocaleString(), " RWF"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[10px] text-muted-foreground",
												children: "No online payment is collected. Our advertising team will contact you to arrange payment outside the app."
											})
										]
									})]
								}) : null]
							})]
						})]
					}),
					step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold text-foreground",
							children: "4. Review & Submit Campaign"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 md:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-border bg-card p-5 space-y-3 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-bold text-sm text-foreground",
											children: "Campaign Summary"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Title:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-foreground",
												children: title
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Placement:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "capitalize font-bold text-foreground",
												children: placement
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Advertising Minutes:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-foreground",
												children: [advertisingMinutes, " min"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Calendar Duration:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-foreground",
												children: [campaignDurationDays, " days"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 rounded-xl border border-border/80 bg-elevated p-3 space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-xs text-foreground block",
												children: [
													"Estimated fee: ",
													priceData?.rwfTotal.toLocaleString() ?? "To be confirmed",
													" RWF"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-muted-foreground text-[11px]",
												children: "No payment is collected in the app. After content approval, the team will contact you to arrange manual payment. Your advertisement starts only after an authorized admin confirms the payment."
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-border bg-card p-5 space-y-3 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-bold text-sm text-foreground",
											children: "Payment contact details"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1 block text-xs font-semibold text-muted-foreground",
											children: "Contact name *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: contactName,
											onChange: (e) => setContactName(e.target.value),
											placeholder: "Your name or business contact"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1 block text-xs font-semibold text-muted-foreground",
											children: "Email address *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "email",
											value: contactEmail,
											onChange: (e) => setContactEmail(e.target.value),
											placeholder: "you@example.com"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1 block text-xs font-semibold text-muted-foreground",
											children: "Phone / WhatsApp number *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RwandaPhoneInput, {
											value: contactPhone,
											onValueChange: setContactPhone,
											placeholder: "+250 788 123 456"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] leading-relaxed text-muted-foreground",
											children: "These details are shared with authorized advertising administrators for campaign payment follow-up. Moderators can review the ad creative but cannot view your payment contact details."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "mb-2 text-xs font-bold text-muted-foreground",
									children: "Final Ad Preview"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
									adType,
									placement,
									title,
									caption,
									ctaText,
									ctaUrl,
									mediaUrl: mediaUrl$1,
									mediaKey,
									thumbnailUrl,
									creatorName: user?.name,
									creatorUsername: user?.username,
									creatorAvatarUrl: user?.avatarUrl || void 0,
									creatorAvatarHue: user?.avatarHue
								})] })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center justify-between border-t border-border pt-4",
						children: [step > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setStep(step - 1),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1.5 size-4" }), " Back"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "brand",
							size: "sm",
							onClick: () => {
								if (step === 1 && !title.trim()) {
									toast.error("Please enter a campaign title");
									return;
								}
								setStep(step + 1);
							},
							children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1.5 size-4" })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "brand",
							size: "lg",
							disabled: createAd.isPending,
							onClick: handleCreateDraft,
							children: createAd.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Creating Campaign…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Submit for Review", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 size-4" })] })
						})]
					})
				]
			})]
		})
	});
}
function AdsPage() {
	const { data: campaigns = [], isLoading } = useMyAds();
	const [wizardOpen, setWizardOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("all");
	const totalImpressions = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.impressions || 0), 0);
	const activeCount = campaigns.filter((campaign) => campaign.status === "active").length;
	const reviewCount = campaigns.filter((campaign) => campaign.status === "pending_review").length;
	const awaitingPaymentCount = campaigns.filter((campaign) => campaign.status === "approved" && campaign.manualPaymentStatus !== "verified").length;
	const filteredCampaigns = campaigns.filter((campaign) => {
		if (tab === "active") return campaign.status === "active";
		if (tab === "pending") return campaign.status === "pending_review";
		if (tab === "unpaid") return campaign.status === "approved" && campaign.manualPaymentStatus !== "verified";
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[920px] space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 text-amber-500" }), " Advertising Center"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Promote your content, products, or brand across Gihanga Updates Feed, Deeds and Decisions."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					size: "lg",
					onClick: () => setWizardOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-5" }), " Create Campaign"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "mx-auto mb-1 size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: activeCount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted-foreground",
								children: "Active Campaigns"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mx-auto mb-1 size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: formatCount(totalImpressions)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted-foreground",
								children: "Total Impressions"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mx-auto mb-1 size-5 text-amber-500" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: reviewCount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted-foreground",
								children: "Awaiting Review"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "mx-auto mb-1 size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: awaitingPaymentCount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted-foreground",
								children: "Awaiting Payment"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold text-foreground",
						children: "Manual payment — no online checkout"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-relaxed text-muted-foreground",
						children: "Submit your campaign with a valid phone number and email. After the creative is approved, our team will contact you to arrange payment outside the app. Ads are published only after an authorized administrator confirms receipt."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-2xl border border-border bg-card p-1",
				children: [
					{
						id: "all",
						label: "All Campaigns"
					},
					{
						id: "active",
						label: "Active"
					},
					{
						id: "pending",
						label: "Pending Review"
					},
					{
						id: "unpaid",
						label: "Awaiting Payment"
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(item.id),
					className: cn("flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all", tab === item.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"),
					children: item.label
				}, item.id))
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Loading your campaigns…"
			}) : filteredCampaigns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-col items-center gap-3 border-dashed py-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-10 text-muted-foreground/60" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-bold text-foreground",
						children: "No campaigns found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-xs text-muted-foreground",
						children: "Launch an advertisement to reach users in Feed, Deeds and Decisions. Campaigns are reviewed before payment is arranged."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						size: "sm",
						onClick: () => setWizardOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Launch Campaign"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: filteredCampaigns.map((campaign) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdCard, { campaign }, campaign._id))
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdWizard, {
		open: wizardOpen,
		onOpenChange: setWizardOpen
	})] });
}
//#endregion
export { AdsPage as component };
