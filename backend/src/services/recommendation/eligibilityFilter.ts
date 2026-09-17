import { CandidateSource } from "./candidateGenerator";
import { Block } from "../../models/Block";
import { NegativeFeedback } from "../../models/NegativeFeedback";
import { ContentView } from "../../models/ContentView";

export async function filterEligibleCandidates(
  candidates: CandidateSource[],
  userId?: string
): Promise<{ eligible: CandidateSource[]; seenMap: Map<string, number> }> {
  const seenMap = new Map<string, number>();
  if (candidates.length === 0) return { eligible: [], seenMap };

  // 1. Basic eligibility filter (must be published and valid author)
  let list = candidates.filter(
    (c) => c.post && c.post.status === "published" && c.post.author
  );

  // Deduplicate by post ID
  const seenIds = new Set<string>();
  list = list.filter((c) => {
    const id = String(c.post._id);
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  if (!userId) {
    return { eligible: list, seenMap };
  }

  // 2. User Blocks & Negative Feedback (Not Interested / Muted Creators)
  const [blocks, negativeFeedbacks, views] = await Promise.all([
    Block.find({ $or: [{ blocker: userId }, { blocked: userId }] }).lean(),
    NegativeFeedback.find({ user: userId }).lean(),
    ContentView.find({ user: userId, content: { $in: Array.from(seenIds) } }).lean(),
  ]);

  const blockedUserIds = new Set<string>();
  blocks.forEach((b) => {
    blockedUserIds.add(String(b.blocker));
    blockedUserIds.add(String(b.blocked));
  });

  const negativeContentIds = new Set<string>();
  const negativeCreatorIds = new Set<string>();
  negativeFeedbacks.forEach((nf) => {
    if (nf.content) negativeContentIds.add(String(nf.content));
    if (nf.creator) negativeCreatorIds.add(String(nf.creator));
  });

  views.forEach((v) => {
    seenMap.set(String(v.content), v.seenCount);
  });

  // Filter out blocked users & explicitly negative feedback targets
  const eligible = list.filter((c) => {
    const authorId = String(c.post.author._id ?? c.post.author);
    const postId = String(c.post._id);

    if (blockedUserIds.has(authorId)) return false;
    if (negativeContentIds.has(postId)) return false;
    if (negativeCreatorIds.has(authorId)) return false;

    return true;
  });

  return { eligible, seenMap };
}
