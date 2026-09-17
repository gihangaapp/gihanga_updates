import { ScoredCandidate } from "./rankingEngine";

export function applyDiversity(
  rankedCandidates: ScoredCandidate[],
  maxAuthorConsecutive = 2,
  maxTagConsecutive = 2
): ScoredCandidate[] {
  if (rankedCandidates.length <= 2) return rankedCandidates;

  const result: ScoredCandidate[] = [];
  const remaining = [...rankedCandidates];

  let authorCountMap = new Map<string, number>();
  let tagCountMap = new Map<string, number>();
  let lastAuthor = "";
  let lastTag = "";

  while (remaining.length > 0) {
    let pickedIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      const authorId = String(item.post.author._id ?? item.post.author);
      const mainTag = item.post.tags[0] || "general";

      const sameAuthorCount = authorId === lastAuthor ? (authorCountMap.get(authorId) || 0) + 1 : 1;
      const sameTagCount = mainTag === lastTag ? (tagCountMap.get(mainTag) || 0) + 1 : 1;

      if (sameAuthorCount <= maxAuthorConsecutive && sameTagCount <= maxTagConsecutive) {
        pickedIndex = i;
        break;
      }
    }

    // Fallback: if all candidates breach spacing rule, pick top remaining
    if (pickedIndex === -1) pickedIndex = 0;

    const [picked] = remaining.splice(pickedIndex, 1);
    const authorId = String(picked.post.author._id ?? picked.post.author);
    const mainTag = picked.post.tags[0] || "general";

    if (authorId === lastAuthor) {
      authorCountMap.set(authorId, (authorCountMap.get(authorId) || 0) + 1);
    } else {
      authorCountMap.set(authorId, 1);
      lastAuthor = authorId;
    }

    if (mainTag === lastTag) {
      tagCountMap.set(mainTag, (tagCountMap.get(mainTag) || 0) + 1);
    } else {
      tagCountMap.set(mainTag, 1);
      lastTag = mainTag;
    }

    result.push(picked);
  }

  return result;
}
