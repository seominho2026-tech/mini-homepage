/* Firestore 한줄평 저장소입니다.
   설정값은 빌드 시 NEXT_PUBLIC_FIREBASE_* 환경변수로 주입됩니다.
   Firebase 웹 설정값은 비밀키가 아니라 프로젝트 식별자이며, 배포된 JS 에 그대로 들어가는 것이
   정상적인 사용법입니다. 실제 접근 제어는 firestore.rules 가 담당합니다. */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type Firestore,
  type Timestamp
} from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

/* 설정이 없으면 Firestore 를 쓰지 않고, 화면은 linktree.ts 의 예시 한줄평으로 대체됩니다. */
export const isGuestbookEnabled = Boolean(config.apiKey && config.projectId);

export const GUESTBOOK_LIMITS = { author: 20, text: 100 } as const;

export type RemoteEntry = {
  id: string;
  author: string;
  text: string;
  date: string;
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getDb() {
  if (!isGuestbookEnabled) return null;
  if (!db) {
    app = getApps()[0] ?? initializeApp(config as Record<string, string>);
    db = getFirestore(app);
  }
  return db;
}

function formatDate(value: unknown) {
  const date = value && typeof (value as Timestamp).toDate === "function"
    ? (value as Timestamp).toDate()
    : new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

/* ---------------------------------------------------------------
   미니홈피 왼쪽 위 TODAY / TOTAL 방문 수입니다.
   counters/site 문서 하나에 total, today, day 를 담아 둡니다.
   --------------------------------------------------------------- */

/* 한줄평과 같은 Firebase 설정을 씁니다. */
export const isCounterEnabled = isGuestbookEnabled;

export type VisitCounts = { total: number; today: number };

/* 하루 경계를 방문자 시간대가 아니라 한국 시간으로 맞춥니다. 2026-08-14 형태입니다. */
function seoulDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

/* 방문 한 번을 기록하고 갱신된 값을 돌려줍니다.
   읽기와 쓰기를 한 트랜잭션으로 처리해서 동시에 들어와도 숫자가 어긋나지 않습니다. */
export async function recordVisit(): Promise<VisitCounts> {
  const store = getDb();
  if (!store) throw new Error("방문 수 기능이 설정되지 않았습니다.");

  const ref = doc(store, "counters", "site");
  const day = seoulDay();

  return runTransaction(store, async transaction => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      const first = { total: 1, today: 1, day };
      transaction.set(ref, first);
      return { total: first.total, today: first.today };
    }

    const data = snapshot.data();
    const total = Number(data.total ?? 0) + 1;
    /* 날짜가 바뀐 뒤 첫 방문이면 오늘 수를 다시 1부터 셉니다. */
    const today = data.day === day ? Number(data.today ?? 0) + 1 : 1;

    transaction.update(ref, { total, today, day });
    return { total, today };
  });
}

/* 한줄평을 실시간으로 구독합니다. 정리 함수를 돌려줍니다. */
export function subscribeGuestbook(
  count: number,
  onData: (entries: RemoteEntry[]) => void,
  onError: (error: Error) => void
) {
  const store = getDb();
  if (!store) return () => {};

  const q = query(collection(store, "guestbook"), orderBy("createdAt", "desc"), fsLimit(count));
  return onSnapshot(
    q,
    snapshot => {
      onData(
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            author: String(data.author ?? ""),
            text: String(data.text ?? ""),
            date: formatDate(data.createdAt)
          };
        })
      );
    },
    error => onError(error as Error)
  );
}

export async function addGuestbookEntry(author: string, text: string) {
  const store = getDb();
  if (!store) throw new Error("한줄평 기능이 설정되지 않았습니다.");

  const trimmedAuthor = author.trim();
  const trimmedText = text.trim();

  if (!trimmedAuthor || !trimmedText) throw new Error("이름과 한줄평을 모두 적어 주세요.");
  if (trimmedAuthor.length > GUESTBOOK_LIMITS.author) throw new Error(`이름은 ${GUESTBOOK_LIMITS.author}자까지 쓸 수 있어요.`);
  if (trimmedText.length > GUESTBOOK_LIMITS.text) throw new Error(`한줄평은 ${GUESTBOOK_LIMITS.text}자까지 쓸 수 있어요.`);

  /* approved 는 지금은 항상 true 입니다. 나중에 승인제로 바꾸려면
     이 값을 false 로 두고 firestore.rules 의 read 조건만 바꾸면 됩니다. */
  await addDoc(collection(store, "guestbook"), {
    author: trimmedAuthor,
    text: trimmedText,
    approved: true,
    createdAt: serverTimestamp()
  });
}

export const COMMUNITY_LIMITS = { author: 20, title: 80, text: 3000, href: 2048, image: 450000 } as const;
export type CommunityKind = "board" | "photo";
export type CommunityPost = { id: string; author: string; title: string; text: string; date: string; href?: string; imageData?: string };
export type NewCommunityPost = { author: string; title: string; text: string; href?: string; imageData?: string };

export function subscribeCommunityPosts(kind: CommunityKind, count: number, onData: (posts: CommunityPost[]) => void, onError: (error: Error) => void) {
  const store = getDb();
  if (!store) { onError(new Error("저장 기능에 연결하지 못했습니다.")); return () => {}; }
  return onSnapshot(query(collection(store, kind === "board" ? "boardEntries" : "photoEntries"), orderBy("createdAt", "desc"), fsLimit(count)), snapshot => {
    onData(snapshot.docs.map(item => {
      const data = item.data();
      return { id: item.id, author: String(data.author ?? ""), title: String(data.title ?? ""), text: String(data.text ?? ""), date: formatDate(data.createdAt), href: typeof data.href === "string" ? data.href : undefined, imageData: typeof data.imageData === "string" ? data.imageData : undefined };
    }));
  }, onError);
}

export async function addCommunityPost(kind: CommunityKind, input: NewCommunityPost) {
  const store = getDb();
  if (!store) throw new Error("저장 기능에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
  const author = input.author.trim(), title = input.title.trim(), text = input.text.trim();
  if (!author || !title) throw new Error("이름과 제목을 적어 주세요.");
  if (author.length > COMMUNITY_LIMITS.author || title.length > COMMUNITY_LIMITS.title || text.length > COMMUNITY_LIMITS.text) throw new Error("입력할 수 있는 글자 수를 넘었습니다.");
  const base = { author, title, text, createdAt: serverTimestamp() };
  if (kind === "board") {
    if (!text) throw new Error("내용을 적어 주세요.");
    const href = (input.href ?? "").trim();
    if (href) {
      let url: URL;
      try { url = new URL(href); } catch { throw new Error("연결 주소를 확인해 주세요. https://로 시작해야 합니다."); }
      if (url.protocol !== "https:" || url.username || url.password || href.length > COMMUNITY_LIMITS.href) throw new Error("연결 주소는 https://로 시작하는 공개 주소만 사용할 수 있어요.");
    }
    return (await addDoc(collection(store, "boardEntries"), { ...base, href })).id;
  }
  const imageData = input.imageData ?? "";
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(imageData) || imageData.length > COMMUNITY_LIMITS.image) throw new Error("사진을 다시 선택해 주세요.");
  return (await addDoc(collection(store, "photoEntries"), { ...base, imageData })).id;
}
