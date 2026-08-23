# PHASE 3 BUGFIX ROUND

Fixes for the issues found after testing Phase 3. All verified with a clean
`tsc --noEmit` on both backend and frontend.

## 1. Story images/videos not showing
Two real bugs, both fixed:
- `StoryViewer.tsx` only ever rendered an `<img>` tag, never a `<video>` —
  so any video story tried to load an .mp4 as an image and showed nothing.
  Added a `mediaType` field to the `Story` model (`"image" | "video"`, set
  correctly by `CreateSheet.tsx` at upload time) and the viewer now renders
  the right element.
- `StoryRail.tsx` had an index bug: clicking "Your story" always opened
  `groups[0]`, which is only your story if you happened to be the
  chronologically-first author with an active story. With more than one
  person's story in the rail, this frequently opened a stranger's story
  instead of yours (looked like "my story isn't showing"). Fixed to find
  your actual position in the list.

## 2. "Modern dotted border" for stories
Added a `story-ring-add` CSS utility (a segmented conic-gradient "dashed
circle") used on your own avatar in the story rail when you don't have an
active story yet — matches the add-story pattern from TikTok/Instagram.
Once you post a story it switches to the existing solid gradient ring.

## 3. Notifications not real-time
They were listening for socket events correctly, but that was the only
mechanism — if the socket connection ever missed a beat, there was no
fallback, and (more importantly) likes/comments/new posts from other users
never propagated anywhere except the notifications bell. Replaced the
scattered per-hook socket listeners with a single `RealtimeProvider`
mounted once at the app root that:
- patches like/comment counts live on every cached post the moment anyone
  reacts, whether or not it's you,
- prepends new public posts into an open feed instantly,
- refreshes the notification list and follower counts live.
This also removes the duplicate-listener inefficiency from before (both
the top bar and the notifications page were separately subscribing to the
same event).

## 4. Follow button showing the wrong state
The follow state was being patched independently in three different
caches (per-post, per-profile, per-suggested-user) with no single source
of truth, so it was easy for one place to say "Follow" while another said
"Following" for the same person. Replaced this with one canonical
`useFollowingSet()` hook (backed by a new `GET /api/v1/follow/mine`
endpoint) that every Follow button in the app now reads from — post cards,
the profile page, suggested creators, and "Follow back" in notifications.

## 5. Followers/following list
Added a real popup (`FollowListDialog`) on the profile page — clicking the
Followers or Following count opens a list of real accounts with working
Follow/Unfollow buttons, using the existing `/follow/:username/followers`
and `/following` endpoints.

## 6. Profile photo upload
This literally didn't exist — "Change photo" in Settings was wired to open
the *story* composer by mistake, not an avatar upload. Fixed: it now
uploads to the real `/uploads/avatars` endpoint (already built in Phase 3
but never wired to any UI) and refreshes your profile everywhere it's shown.

## 7. Bookmarking a post didn't save
Found the actual cause: the optimistic-update helper (`updatePostEverywhere`)
assumed every cached "posts"-prefixed query was a paginated feed
(`{ pages: [...] }`). The bookmarks list and the profile "Likes" tab are
*not* paginated (`{ posts: [...] }`), so the instant either of those pages
had ever been visited once, the helper crashed trying to read `.pages` off
the wrong shape — which silently killed the *entire* mutation before the
real API call even fired. This affected likes too, not just bookmarks,
under the same condition. Fixed to handle both cache shapes correctly.

## 8. Images/videos being cropped
Post images/videos in the feed used a fixed aspect ratio with
`object-cover`, which crops anything that isn't that exact ratio. Switched
to `object-contain` with a sensible max-height so the full image or video
is always visible, regardless of its original dimensions. (Grid views —
profile grid, bookmarks grid — intentionally keep the square crop; that's
standard for a grid layout, not a bug.)

## Not yet started
Phase 4 (Creator Studio analytics, Wallet + MTN MoMo, reward engine, Ads,
live streaming with WebRTC + gifting, moderator live controls) — see the
next message for how I'm proposing to tackle it.
