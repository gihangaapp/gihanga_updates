import { Notification, NotificationKind } from "../models/Notification";
import { emitToUser } from "./socket";

interface NotifyInput {
  recipient: string;
  actor?: string;
  kind: NotificationKind;
  text: string;
  relatedPost?: string;
  relatedLive?: string;
}

/** Writes a notification and pushes it live to the recipient. Never notifies yourself. */
export async function notify(input: NotifyInput) {
  if (input.actor && input.actor === input.recipient) return null;

  const doc = await Notification.create({
    recipient: input.recipient,
    actor: input.actor,
    kind: input.kind,
    text: input.text,
    relatedPost: input.relatedPost,
    relatedLive: input.relatedLive,
  });

  const populated = await doc.populate("actor", "name username avatarHue avatarUrl");
  emitToUser(input.recipient, "notification:new", populated);
  return populated;
}
