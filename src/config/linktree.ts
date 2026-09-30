export const profile = {
  teacherName: "민호 선생님",
  title: "민호 선생님! 학교 생활 Lab",
  introTitle: "민호 선생님! 학교 생활 Lab",
  introDescription: "배움과 즐거움이 함께하는 민호쌤의 학교 생활 연구소",
  catalogTitle: "학교 생활 Lab",
  catalogDescription: "학교 생활 Lab",
  /* 왼쪽 프로필 사진입니다. public/assets/ 안에 파일을 넣고 경로를 적으세요. */
  photo: { src: "/assets/minho/profile.jpg", alt: "안경 쓴 민호 선생님 캐릭터" },
  /* 홈 탭 위쪽 미니룸 이미지입니다. public/assets/ 안에 파일을 넣고 경로를 적으세요. */
  miniroom: { src: "/assets/minho/miniroom-v2.png", alt: "국어 선생님 캐릭터와 책, 고양이, AI 로봇이 함께하는 아늑한 미니룸" },
  /* 아래는 탭 이름표입니다. 나만의 이름으로 바꿔도 되고, 안 바꾸면 기본값 그대로 나옵니다. */
  storyLabel: "연재물",
  boardLabel: "게시판",
  boardSubtitle: "앱과 게시글",
  boardEmptyText: "아직 올린 글이 없습니다.",
  photoLabel: "사진첩",
  photoSubtitlePrefix: "사진",
  /* 오른쪽 위, 옛날 싸이월드 주소창을 흉내 낸 문구입니다. */
  displayUrl: "seominho2026-tech.github.io/mini-homepage"
};

/* 프로필 탭에 들어가는 소개 글입니다. 문구만 바꿔서 쓰세요. */
export type ProfileBlock =
  | { kind: "text"; lines: string[] }
  | { kind: "list"; heading: string; items: string[] }
  | { kind: "contact"; items: { label: string; value: string; href: string }[] };

export type ProfileSection = {
  id: string;
  title: string;
  /* 제목 옆 작은 글씨입니다. 생략하면 제목만 나옵니다. */
  subtitle?: string;
  blocks: ProfileBlock[];
};

export const profileSections: ProfileSection[] = [];

/* 미요툰 회차는 src/config/miyotoon.ts 에 있습니다. */
export { episodes, type Episode } from "./miyotoon";

/* 미요앱 탭입니다. 앱과 게시글 링크를 여기에 추가하세요.
   preview 는 화면 미리보기 이미지입니다. public/assets/apps 에 넣고 경로를 적으세요.
   생략하면 썸네일 없이 제목만 나옵니다. */
export type BoardPost = {
  id: string;
  category: "앱" | "글";
  title: string;
  summary?: string;
  date: string;
  href: string;
  preview?: { src: string; alt: string };
};

export const boardPosts: BoardPost[] = [
  {
    "id": "seongmo-portal",
    "category": "앱",
    "title": "성모찹",
    "date": "2026.09.30",
    "href": "https://seongmohs.my.canva.site/portal"
  }
];

/* 사진첩 탭입니다. */
export type PhotoItem = {
  id: string;
  name: string;
  src: string;
};

export const photos: PhotoItem[] = [
  {
    "id": "stickers-1",
    "name": "학교 생활 캐릭터 모음 1",
    "src": "/assets/minho/gallery-1.png"
  },
  {
    "id": "stickers-2",
    "name": "학교 생활 캐릭터 모음 2",
    "src": "/assets/minho/gallery-2.png"
  },
  {
    "id": "stickers-3",
    "name": "학교 생활 캐릭터 모음 3",
    "src": "/assets/minho/gallery-3.png"
  },
  {
    "id": "stickers-4",
    "name": "학교 생활 캐릭터 모음 4",
    "src": "/assets/minho/gallery-4.png"
  },
  {
    "id": "stickers-5",
    "name": "학교 생활 캐릭터 모음 5",
    "src": "/assets/minho/gallery-5.png"
  }
];

/* 왼쪽 아래 파도타기 목록입니다.
   고정 규칙: 첫 번째 항목은 반드시 "도름스 커뮤니티 나의 활동" 링크입니다. 지우지 마세요. */
export type WaveLink = {
  id: string;
  label: string;
  href: string;
};

export const waveLinks: WaveLink[] = [
  { id: "dorms-activity", label: "도름스 커뮤니티 나의 활동", href: "https://dorms.school/u/7cb75ce4-66c4-4409-a2e0-d128d48f0188" },
  { id: "meyo-lab", label: "미요앱 실험실", href: "https://pcallpang.github.io/meyo-lab/" }
];

/* 미니홈피 BGM 입니다. 유튜브 영상을 음원으로 씁니다.
   videoId 는 https://www.youtube.com/watch?v=abcd1234XYZ 에서 v= 뒤에 오는 값입니다.
   배열을 비우면 플레이어가 아예 표시되지 않습니다.

   여러 곡이 이어진 플레이리스트 영상이라면, 같은 videoId 를 쓰면서 startAt 에
   각 곡이 시작하는 지점을 초 단위로 적으세요. 제목을 누르면 그 지점부터 재생됩니다.
   startAt 은 secondsAt("3:21") 처럼 적으면 편합니다. */
export type BgmTrack = {
  id: string;
  title: string;
  artist?: string;
  videoId: string;
  /* 영상 안에서 이 곡이 시작하는 지점입니다. 초 단위이고, 생략하면 처음부터입니다. */
  startAt?: number;
};

/* "3:21" 이나 "1:02:30" 을 초로 바꿔 줍니다. */
export function secondsAt(timestamp: string): number {
  return timestamp
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

export const bgmTracks: BgmTrack[] = [
  {
    "id": "bgm-1",
    "title": "내 입술… 따뜻한 커피처럼",
    "artist": "샵",
    "videoId": "JloYeVxERmI",
    "startAt": 0
  },
  {
    "id": "bgm-2",
    "title": "Y (Please Tell Me Why)",
    "artist": "프리스타일",
    "videoId": "DC13_hnbzCA",
    "startAt": 0
  },
  {
    "id": "bgm-3",
    "title": "우산 (Feat. 윤하)",
    "artist": "에픽하이",
    "videoId": "Qr13kGXORrk",
    "startAt": 0
  },
  {
    "id": "bgm-4",
    "title": "귀로",
    "artist": "나얼",
    "videoId": "0qaS_-gJlT0",
    "startAt": 0
  }
];

/* 홈 탭 아래쪽 한마디입니다. */
export type GuestbookEntry = {
  id: number;
  author: string;
  text: string;
  date: string;
};

export const guestbook: GuestbookEntry[] = [
  {
    "id": 1,
    "author": "조한정",
    "text": "사이월드 안써봤는데 신기한데요?",
    "date": "2026.09.30"
  },
  {
    "id": 2,
    "author": "최형진",
    "text": "레전드...!",
    "date": "2026.09.30"
  }
];
