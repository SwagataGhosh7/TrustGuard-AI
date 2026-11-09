import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Bell,
  Check,
  Heart,
  MessageCircle,
  Send,
  Share2,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

interface CommunityProfile {
  id: string;
  displayName: string;
  photoURL: string | null;
}

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  body: string;
  createdAt?: { toDate?: () => Date } | null;
  likedBy?: string[];
  shareCount?: number;
  commentCount?: number;
}

interface CommunityComment {
  id: string;
  authorName: string;
  authorPhotoURL: string | null;
  body: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt?: { toDate?: () => Date } | null;
}

function Avatar({ name, photoURL, size = "size-9" }: CommunityProfile & { size?: string }) {
  return photoURL ? (
    <img
      src={photoURL}
      alt={`${name} profile`}
      referrerPolicy="no-referrer"
      className={`${size} rounded-full border border-[#2dd4bf]/50 object-cover`}
    />
  ) : (
    <span
      className={`flex ${size} items-center justify-center rounded-full border border-[#2dd4bf]/50 bg-[#2dd4bf]/10 text-xs font-bold text-[#2dd4bf]`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function formatDate(value: CommunityPost["createdAt"]) {
  return value?.toDate ? value.toDate().toLocaleString() : "Just now";
}

export function CommunityHub() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [profiles, setProfiles] = useState<CommunityProfile[]>([]);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<CommunityProfile | null>(null);
  const [selectedChat, setSelectedChat] = useState<CommunityProfile | null>(null);
  const [body, setBody] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [chatDraft, setChatDraft] = useState("");
  const [notice, setNotice] = useState("");

  const chatId = useMemo(() => {
    if (!user || !selectedChat) return null;
    return [user.uid, selectedChat.id].sort().join("_");
  }, [selectedChat, user]);

  useEffect(() => {
    if (!db || !user) return;
    const profileRef = doc(db, "profiles", user.uid);
    void setDoc(
      profileRef,
      {
        displayName: user.displayName || user.email?.split("@")[0] || "Analyst",
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    const postsQuery = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"), limit(50));
    const profilesQuery = query(collection(db, "profiles"), orderBy("displayName"), limit(50));
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      where("read", "==", false),
      limit(20),
    );
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as CommunityPost));
    });
    const unsubscribeProfiles = onSnapshot(profilesQuery, (snapshot) => {
      setProfiles(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as CommunityProfile));
    });
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      setNotificationCount(snapshot.size);
    });
    return () => {
      unsubscribePosts();
      unsubscribeProfiles();
      unsubscribeNotifications();
    };
  }, [user]);

  useEffect(() => {
    if (!db || !chatId || !user || !selectedChat) {
      setMessages([]);
      return;
    }
    const conversationRef = doc(db, "conversations", chatId);
    void setDoc(
      conversationRef,
      { members: [user.uid, selectedChat.id], updatedAt: serverTimestamp() },
      { merge: true },
    );
    const messagesQuery = query(
      collection(conversationRef, "messages"),
      orderBy("createdAt", "asc"),
      limit(100),
    );
    return onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ChatMessage));
    });
  }, [chatId, selectedChat, user]);

  const loadComments = (postId: string) => {
    if (!db || comments[postId]) return;
    const commentsQuery = query(
      collection(db, "communityPosts", postId, "comments"),
      orderBy("createdAt", "asc"),
      limit(50),
    );
    onSnapshot(commentsQuery, (snapshot) => {
      setComments((current) => ({
        ...current,
        [postId]: snapshot.docs.map(
          (item) => ({ id: item.id, ...item.data() }) as CommunityComment,
        ),
      }));
    });
  };

  const createPost = async (event: FormEvent) => {
    event.preventDefault();
    if (!db || !user || !body.trim()) return;
    await addDoc(collection(db, "communityPosts"), {
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Analyst",
      authorPhotoURL: user.photoURL || null,
      body: body.trim(),
      likedBy: [],
      shareCount: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
    });
    setBody("");
    setNotice("Post published to the community.");
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!db || !user) return;
    const liked = post.likedBy?.includes(user.uid);
    await updateDoc(doc(db, "communityPosts", post.id), {
      likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
    if (!liked && post.authorId !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        recipientId: post.authorId,
        actorId: user.uid,
        type: "like",
        postId: post.id,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  };

  const sharePost = async (post: CommunityPost) => {
    if (!db || !user) return;
    const shareText = `${post.authorName}: ${post.body}`;
    if (navigator.share) {
      await navigator.share({ title: "TrustGuard community post", text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setNotice("Post copied to your clipboard.");
    }
    await updateDoc(doc(db, "communityPosts", post.id), {
      shareCount: (post.shareCount || 0) + 1,
    });
  };

  const addComment = async (post: CommunityPost) => {
    if (!db || !user || !commentDrafts[post.id]?.trim()) return;
    await addDoc(collection(db, "communityPosts", post.id, "comments"), {
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Analyst",
      authorPhotoURL: user.photoURL || null,
      body: commentDrafts[post.id].trim(),
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "communityPosts", post.id), {
      commentCount: (post.commentCount || 0) + 1,
    });
    if (post.authorId !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        recipientId: post.authorId,
        actorId: user.uid,
        type: "comment",
        postId: post.id,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
    setCommentDrafts((current) => ({ ...current, [post.id]: "" }));
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!db || !user || !chatId || !chatDraft.trim()) return;
    await addDoc(collection(db, "conversations", chatId, "messages"), {
      senderId: user.uid,
      body: chatDraft.trim(),
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "conversations", chatId), { updatedAt: serverTimestamp() });
    setChatDraft("");
  };

  if (!user) return null;
  if (!db) {
    return (
      <div className="border border-red-500/40 bg-red-950/20 p-5 text-sm text-red-300">
        Community services are unavailable because Firebase Firestore is not configured.
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <form onSubmit={createPost} className="border border-[#2dd4bf]/30 bg-[#0c1017] p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar
              id={user.uid}
              name={user.displayName || "Analyst"}
              photoURL={user.photoURL}
            />
            <span className="font-pixel text-xs text-[#a3e635]">SHARE WITH THE COMMUNITY</span>
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share an investigation, observation, or security thought..."
            rows={3}
            className="w-full resize-none border border-[#243346] bg-black/50 p-3 text-sm text-white outline-none focus:border-[#2dd4bf]"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">Posts are visible to signed-in analysts.</span>
            <Button type="submit" disabled={!body.trim()} className="rounded-none bg-[#2dd4bf] text-black">
              <Send size={14} className="mr-2" /> Publish
            </Button>
          </div>
        </form>

        {notice && (
          <div className="flex items-center gap-2 border border-[#a3e635]/30 bg-[#a3e635]/10 px-3 py-2 text-xs text-[#a3e635]">
            <Check size={14} /> {notice}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="border border-[#243346] p-10 text-center text-sm text-zinc-400">
            No community posts yet. Start the conversation.
          </div>
        ) : (
          posts.map((post) => {
            const liked = post.likedBy?.includes(user.uid);
            return (
              <article key={post.id} className="border border-[#243346] bg-[#0c1017] p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProfile({
                        id: post.authorId,
                        displayName: post.authorName,
                        photoURL: post.authorPhotoURL,
                      })
                    }
                    className="flex items-center gap-3 text-left"
                  >
                    <Avatar
                      id={post.authorId}
                      name={post.authorName}
                      photoURL={post.authorPhotoURL}
                    />
                    <span>
                      <strong className="block text-sm text-white">{post.authorName}</strong>
                      <small className="text-[10px] text-zinc-500">{formatDate(post.createdAt)}</small>
                    </span>
                  </button>
                  <span className="text-[10px] text-[#2dd4bf]">ANALYST POST</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-[#243346] pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void toggleLike(post)}
                    className={liked ? "text-pink-400" : "text-zinc-400"}
                  >
                    <Heart size={14} className="mr-1.5" fill={liked ? "currentColor" : "none"} />
                    {post.likedBy?.length || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadComments(post.id)}
                    className="text-zinc-400"
                  >
                    <MessageCircle size={14} className="mr-1.5" /> {post.commentCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void sharePost(post)} className="text-zinc-400">
                    <Share2 size={14} className="mr-1.5" /> {post.shareCount || 0}
                  </Button>
                </div>
                {comments[post.id] && (
                  <div className="mt-3 space-y-2 border-t border-[#243346] pt-3">
                    {comments[post.id].map((comment) => (
                      <div key={comment.id} className="flex gap-2 text-xs text-zinc-300">
                        <Avatar id={comment.id} name={comment.authorName} photoURL={comment.authorPhotoURL} size="size-6" />
                        <p><strong className="text-white">{comment.authorName}</strong> {comment.body}</p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))
                        }
                        placeholder="Write a comment..."
                        className="h-8 rounded-none bg-black/40 text-xs"
                      />
                      <Button type="button" size="sm" onClick={() => void addComment(post)} className="rounded-none">
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      <aside className="space-y-5">
        <div className="border border-[#243346] bg-[#0c1017] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-[#a3e635]">
            <Users size={15} /> COMMUNITY ANALYSTS
          </div>
          <div className="space-y-2">
            {profiles.filter((profile) => profile.id !== user.uid).map((profile) => (
              <div key={profile.id} className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setSelectedProfile(profile)} className="flex items-center gap-2">
                  <Avatar {...profile} size="size-7" />
                  <span className="text-xs text-zinc-200">{profile.displayName}</span>
                </button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedChat(profile)} className="h-7 px-2 text-[#2dd4bf]">
                  Chat
                </Button>
              </div>
            ))}
            {profiles.length <= 1 && <p className="text-xs text-zinc-500">Other analyst profiles appear as they join.</p>}
          </div>
        </div>

        <div className="border border-[#243346] bg-[#0c1017] p-4">
          <div className="flex items-center gap-2 text-xs text-[#fef08a]">
            <Bell size={15} /> NOTIFICATIONS
            {notificationCount > 0 && (
              <span className="rounded-full bg-[#ff6b35] px-1.5 py-0.5 text-[10px] text-black">
                {notificationCount}
              </span>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Likes and comments on your posts appear here in real time.
          </p>
        </div>
      </aside>

      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedProfile(null)}>
          <div className="w-full max-w-sm border border-[#2dd4bf]/50 bg-[#0c1017] p-6 text-center" onClick={(event) => event.stopPropagation()}>
            <Avatar {...selectedProfile} size="size-16" />
            <h3 className="mt-3 text-lg text-white">{selectedProfile.displayName}</h3>
            <p className="mt-1 text-xs text-zinc-500">TrustGuard community analyst</p>
            {selectedProfile.id !== user.uid && (
              <Button onClick={() => { setSelectedChat(selectedProfile); setSelectedProfile(null); }} className="mt-4 rounded-none bg-[#2dd4bf] text-black">
                <MessageCircle size={14} className="mr-2" /> Start chat
              </Button>
            )}
          </div>
        </div>
      )}

      {selectedChat && chatId && (
        <div className="fixed bottom-4 right-4 z-40 flex h-[min(500px,80vh)] w-[min(380px,calc(100vw-2rem))] flex-col border border-[#2dd4bf]/50 bg-[#0c1017] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#243346] p-3">
            <div className="flex items-center gap-2"><Avatar {...selectedChat} size="size-7" /><span className="text-sm text-white">{selectedChat.displayName}</span></div>
            <button type="button" onClick={() => setSelectedChat(null)} className="text-zinc-500">×</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((message) => (
              <div key={message.id} className={`max-w-[85%] rounded px-3 py-2 text-xs ${message.senderId === user.uid ? "ml-auto bg-[#2dd4bf] text-black" : "bg-[#243346] text-white"}`}>
                {message.body}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-[#243346] p-3">
            <Input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Type a message..." className="h-8 rounded-none text-xs" />
            <Button type="submit" size="sm" className="rounded-none"><Send size={14} /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
