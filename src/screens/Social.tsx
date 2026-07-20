import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Plus,
  Send,
  Trophy,
  UserPlus,
  Users
} from "lucide-react";
import { useApp } from "../store/AppStore";
import { getCourse } from "../data/courses";
import { FRIENDS, personName } from "../data/players";
import type { FeedPost, Friend } from "../types";
import {
  Avatar,
  Card,
  LargeTitle,
  SegmentedControl,
  Sheet
} from "../components/ui";
import { formatToPar } from "../lib/scoring";
import { timeAgo } from "../lib/format";

export function Social() {
  const [tab, setTab] = useState<"feed" | "friends">("feed");
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [profileFor, setProfileFor] = useState<Friend | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);

  return (
    <div>
      <LargeTitle
        title="Social"
        right={
          <button
            onClick={() => setGroupOpen(true)}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-card2 text-accent"
            aria-label="Create group"
          >
            <Plus size={18} />
          </button>
        }
      >
        <p className="text-[15px] text-sub">
          Your crew across Finland and beyond
        </p>
      </LargeTitle>

      <div className="px-4 pb-4">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "feed", label: "Feed" },
            { value: "friends", label: "Friends" }
          ]}
        />
      </div>

      {tab === "feed" ? (
        <Feed onOpenComments={setCommentsFor} />
      ) : (
        <FriendList onOpenProfile={setProfileFor} />
      )}

      <CommentsSheet postId={commentsFor} onClose={() => setCommentsFor(null)} />
      <ProfileSheet friend={profileFor} onClose={() => setProfileFor(null)} />
      <CreateGroupSheet open={groupOpen} onClose={() => setGroupOpen(false)} />
    </div>
  );
}

function Feed({ onOpenComments }: { onOpenComments: (id: string) => void }) {
  const navigate = useNavigate();
  const { feed, likedPosts, toggleLike } = useApp();

  return (
    <div className="space-y-2.5 px-4">
      {feed.map((post) => {
        const liked = likedPosts.includes(post.id);
        return (
          <Card key={post.id} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={personName(post.authorId)} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-snug">
                  <span className="font-semibold">
                    {personName(post.authorId)}
                  </span>{" "}
                  <span className="text-sub">{post.title}</span>
                </p>
                <p className="text-[12px] text-sub">{timeAgo(post.date)}</p>
              </div>
              {post.score != null && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[13px] font-bold tabular-nums ${
                    post.score < 0
                      ? "bg-birdie/15 text-birdie"
                      : "bg-card2 text-sub"
                  }`}
                >
                  {formatToPar(post.score)}
                </span>
              )}
              {post.kind === "milestone" && (
                <Trophy size={18} className="shrink-0 text-accent" />
              )}
            </div>
            <p className="mt-3 text-[14px] leading-snug">{post.body}</p>
            {post.courseId && (
              <button
                onClick={() => navigate(`/courses/${post.courseId}`)}
                className="mt-2 text-[13px] font-semibold text-accent"
              >
                {getCourse(post.courseId).name}
              </button>
            )}
            <div className="mt-3 flex items-center gap-5 border-t border-sep pt-2.5">
              <button
                onClick={() => toggleLike(post.id)}
                className={`press flex items-center gap-1.5 text-[13px] font-semibold ${
                  liked ? "text-accent" : "text-sub"
                }`}
              >
                <Heart size={17} fill={liked ? "currentColor" : "none"} />
                {post.likes}
              </button>
              <button
                onClick={() => onOpenComments(post.id)}
                className="press flex items-center gap-1.5 text-[13px] font-semibold text-sub"
              >
                <MessageCircle size={17} />
                {post.comments.length}
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function FriendList({ onOpenProfile }: { onOpenProfile: (f: Friend) => void }) {
  return (
    <div className="px-4">
      <Card className="divide-y divide-sep">
        {FRIENDS.map((f) => (
          <button
            key={f.id}
            onClick={() => onOpenProfile(f)}
            className="flex w-full items-center gap-3 p-3.5 text-left"
          >
            <Avatar name={f.name} size={42} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold">{f.name}</p>
              <p className="text-[13px] text-sub">
                {f.handle} · {f.homeCity}
              </p>
            </div>
            <span
              className={`text-[14px] font-bold tabular-nums ${
                f.avgToPar < 0 ? "text-birdie" : "text-sub"
              }`}
            >
              {f.avgToPar > 0 ? "+" : ""}
              {f.avgToPar.toFixed(1)}
            </span>
          </button>
        ))}
      </Card>
      <p className="px-2 pt-2 text-[12px] text-sub">
        Average score to par over the last 20 rounds.
      </p>
    </div>
  );
}

function CommentsSheet({
  postId,
  onClose
}: {
  postId: string | null;
  onClose: () => void;
}) {
  const { feed, addComment } = useApp();
  const [text, setText] = useState("");
  const post: FeedPost | undefined = feed.find((p) => p.id === postId);

  const send = () => {
    const t = text.trim();
    if (!t || !post) return;
    addComment(post.id, t);
    setText("");
  };

  return (
    <Sheet open={postId != null} onClose={onClose} title="Comments">
      {post && (
        <div className="px-5">
          {post.comments.length === 0 && (
            <p className="py-6 text-center text-[14px] text-sub">
              No comments yet — be the first.
            </p>
          )}
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-3 border-b border-sep py-3 last:border-0">
              <Avatar name={personName(c.authorId)} size={32} />
              <div>
                <p className="text-[13px]">
                  <span className="font-semibold">{personName(c.authorId)}</span>{" "}
                  <span className="text-sub">· {timeAgo(c.date)}</span>
                </p>
                <p className="mt-0.5 text-[14px] leading-snug">{c.text}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Add a comment…"
              className="flex-1 rounded-full bg-card2 px-4 py-2.5 text-[15px] placeholder:text-sub"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className="press flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white disabled:opacity-30"
              aria-label="Send comment"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function ProfileSheet({
  friend,
  onClose
}: {
  friend: Friend | null;
  onClose: () => void;
}) {
  const { showToast } = useApp();
  return (
    <Sheet open={friend != null} onClose={onClose}>
      {friend && (
        <div className="px-5 pb-2 text-center">
          <Avatar name={friend.name} size={72} className="mx-auto" />
          <p className="mt-3 text-[22px] font-bold">{friend.name}</p>
          <p className="text-[14px] text-sub">
            {friend.handle} · {friend.homeCity}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Card className="bg-card2 p-4">
              <p className="text-[24px] font-bold tabular-nums">
                {friend.roundsPlayed}
              </p>
              <p className="text-[12px] text-sub">Rounds played</p>
            </Card>
            <Card className="bg-card2 p-4">
              <p
                className={`text-[24px] font-bold tabular-nums ${
                  friend.avgToPar < 0 ? "text-birdie" : ""
                }`}
              >
                {friend.avgToPar > 0 ? "+" : ""}
                {friend.avgToPar.toFixed(1)}
              </p>
              <p className="text-[12px] text-sub">Avg to par</p>
            </Card>
          </div>
          <button
            onClick={() => {
              showToast(`Challenge sent to ${friend.name.split(" ")[0]}`);
              onClose();
            }}
            className="press mt-4 w-full rounded-full bg-accent py-3 text-[15px] font-bold text-white"
          >
            Challenge to a round
          </button>
        </div>
      )}
    </Sheet>
  );
}

function CreateGroupSheet({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { showToast } = useApp();
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const toggle = (id: string) =>
    setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const create = () => {
    showToast(`Group “${name.trim()}” created`);
    setName("");
    setMembers([]);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Create group">
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-cell bg-card2 px-4 py-3">
          <Users size={18} className="text-sub" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name, e.g. Tuesday League"
            className="w-full bg-transparent text-[15px] placeholder:text-sub"
          />
        </div>
        <p className="px-1 pb-2 pt-4 text-[13px] font-semibold uppercase tracking-wide text-sub">
          Members
        </p>
        <div className="max-h-[280px] overflow-y-auto">
          {FRIENDS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              className="flex w-full items-center gap-3 border-b border-sep py-2.5 text-left last:border-0"
            >
              <Avatar name={f.name} size={34} />
              <p className="flex-1 text-[14px] font-semibold">{f.name}</p>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
                  members.includes(f.id)
                    ? "bg-accent"
                    : "shadow-[inset_0_0_0_1.5px_var(--c-sep)]"
                }`}
              >
                {members.includes(f.id) && <UserPlus size={13} />}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={create}
          disabled={!name.trim() || members.length === 0}
          className="press mt-4 w-full rounded-full bg-accent py-3 text-[15px] font-bold text-white disabled:opacity-30"
        >
          Create group · {members.length} selected
        </button>
      </div>
    </Sheet>
  );
}
