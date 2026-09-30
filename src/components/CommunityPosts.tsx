"use client";

import { useEffect, useRef, useState } from "react";
import { boardPosts, photos, profile } from "@/config/linktree";
import { asset } from "@/lib/asset";
import { addCommunityPost, COMMUNITY_LIMITS, isGuestbookEnabled, subscribeCommunityPosts, type CommunityKind, type CommunityPost } from "@/lib/firebase";
import DeletePostButton, { useWriter } from "@/components/DeletePostButton";
import { preparePhoto } from "@/lib/photo";

function WriteForm({ kind, onClose, onSaved }: { kind: CommunityKind; onClose: () => void; onSaved: () => void }) {
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [href, setHref] = useState("");
  const [imageData, setImageData] = useState("");
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const selection = useRef(0);
  useEffect(() => () => { selection.current += 1; }, []);
  async function selectPhoto(file?: File) {
    const version = ++selection.current;
    setImageData(""); setError("");
    if (!file) { setProcessing(false); return; }
    setProcessing(true);
    try { const prepared = await preparePhoto(file); if (version === selection.current) setImageData(prepared); }
    catch (e) { if (version === selection.current) setError(e instanceof Error ? e.message : "사진을 준비하지 못했어요."); }
    finally { if (version === selection.current) setProcessing(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || processing) return;
    lock.current = true; setSending(true); setError("");
    try { await addCommunityPost(kind, { author, title, text, href, imageData }); onSaved(); }
    catch (e) { const code = (e as { code?: string }).code; setError(code ? "저장하지 못했어요. 연결 상태와 입력 내용을 확인한 뒤 다시 시도해 주세요." : e instanceof Error ? e.message : "저장하지 못했어요."); }
    finally { lock.current = false; setSending(false); }
  }
  return <form className="cy-write-form" onSubmit={submit}>
    <h3>{kind === "photo" ? "사진첩 글쓰기" : kind === "lab" ? "실험실 글쓰기" : "게시판 글쓰기"}</h3>
    <p className="cy-write-note">로그인 없이 작성할 수 있어요. 이름과 글은 모두에게 공개됩니다. 작성한 브라우저에서 내 글을 삭제할 수 있어요. 브라우저 데이터를 지우면 삭제 권한도 사라져요.</p>
    <fieldset disabled={sending}>
      <label>이름<input autoFocus required maxLength={COMMUNITY_LIMITS.author} value={author} onChange={e => setAuthor(e.target.value)} /></label>
      <label>제목<input required maxLength={COMMUNITY_LIMITS.title} value={title} onChange={e => setTitle(e.target.value)} /></label>
      {kind !== "board" && <label>{kind === "lab" ? "작은 그림" : "사진"}<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => void selectPhoto(e.target.files?.[0])} /><span className="cy-write-note">JPG·PNG·WEBP, 15MB까지. 사진 크기는 자동으로 줄여 저장합니다.</span></label>}
      {processing && <p role="status">사진을 준비하고 있어요…</p>}
      {imageData && <img className="cy-upload-preview" src={imageData} alt="올릴 사진 미리보기" />}
      <label>{kind === "photo" ? "사진 설명 (선택)" : kind === "lab" ? "설명" : "내용"}<textarea required={kind !== "photo"} rows={5} maxLength={COMMUNITY_LIMITS.text} value={text} onChange={e => setText(e.target.value)} /></label>
      {kind !== "photo" && <label>연결 주소 (선택)<input type="url" placeholder="https://" maxLength={COMMUNITY_LIMITS.href} value={href} onChange={e => setHref(e.target.value)} /></label>}
      {error && <p role="alert" className="cy-write-error">{error}</p>}
      <div className="cy-write-actions"><button type="submit" className="cy-write-button" disabled={processing || (kind !== "board" && !imageData)}>{sending ? "저장 중…" : "등록하기"}</button><button type="button" className="cy-cancel-button" onClick={onClose}>취소</button></div>
    </fieldset>
  </form>;
}

export default function CommunityPosts({ kind }: { kind: CommunityKind }) {
  const uid = useWriter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [writing, setWriting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(12);
  useEffect(() => {
    setLoading(true); setError(false);
    return subscribeCommunityPosts(kind, count, data => { setPosts(data); setLoading(false); setError(false); }, () => { setError(true); setLoading(false); });
  }, [kind, count]);
  const photo = kind === "photo";
  return <div className="cy-content-box">
    <div className="cy-section-title">{photo ? profile.photoLabel : kind === "lab" ? "실험실" : profile.boardLabel}<span className="cy-sub-text">누구나 함께 쓰는 공간</span></div>
    <div className="cy-write-toolbar"><span>{kind === "lab" ? "작은 아이디어와 만든 앱을 소개해 주세요." : "이야기를 남겨 주세요."}</span><button type="button" className="cy-write-button" disabled={!isGuestbookEnabled} aria-expanded={writing} onClick={() => { setWriting(!writing); setSaved(false); }}>글쓰기</button></div>
    {writing && <WriteForm kind={kind} onClose={() => setWriting(false)} onSaved={() => { setWriting(false); setSaved(true); }} />}
    {saved && <p role="status" className="cy-write-success">글을 등록했어요!</p>}
    {loading && <p role="status" className="cy-write-note">글을 불러오고 있어요…</p>}
    {error && <p role="alert" className="cy-write-error">새 글을 불러오지 못했어요. 새로고침해 주세요.</p>}
    {!loading && !error && posts.length === 0 && <p className="cy-empty-posts">아직 등록된 {photo ? "사진이" : "글이"} 없어요. 첫 글을 남겨 주세요!</p>}
    <div className={photo ? "cy-community-photos" : kind === "lab" ? "cy-community-lab" : "cy-community-board"}>
      {posts.map(post => <article key={post.id} className={`cy-public-post${kind === "lab" ? " cy-lab-post" : ""}`}>
        {kind === "lab" && post.imageData && <div className="cy-lab-thumbnail"><img src={post.imageData} alt={post.title} loading="lazy" /></div>}
        <div className="cy-post-content">
        <h3>{kind === "lab" && post.href && post.href.startsWith("https://") ? <a href={post.href} target="_blank" rel="noopener noreferrer">{post.title} ↗</a> : post.title}</h3><p className="cy-post-meta">{post.author} · {post.date}</p>
        {photo && post.imageData && <img className="cy-post-photo" src={post.imageData} alt={post.title} loading="lazy" />}
        {post.text && <p className="cy-post-body">{post.text}</p>}
        {!photo && post.href && /^https:\/\//i.test(post.href) && <a className="cy-post-link" href={post.href} target="_blank" rel="noopener noreferrer">연결 주소 열기 ↗</a>}
        {uid && post.ownerId === uid && <DeletePostButton kind={kind} id={post.id} />}
        </div>
      </article>)}
    </div>
    {posts.length === count && <button type="button" className="cy-cancel-button cy-load-more" onClick={() => setCount(n => n + 12)}>이전 글 더 보기</button>}
    {kind !== "lab" && (photo ? <ul className="cy-photo-grid">{photos.map(item => <li key={item.id} className="cy-photo-item"><div className="cy-photo-frame"><img src={asset(item.src)} alt={item.name} loading="lazy" /></div></li>)}</ul> : <ul className="cy-board-list">{boardPosts.map(post => <li key={post.id} className="cy-board-item"><a className="cy-board-link" href={post.href} target="_blank" rel="noopener noreferrer">{post.preview && <span className="cy-board-preview"><img src={asset(post.preview.src)} alt={post.preview.alt} loading="lazy" /></span>}<span className="cy-board-text"><span className="cy-board-head"><span className="cy-board-category">{post.category}</span><span className="cy-board-title">{post.title}</span></span>{post.summary && <span className="cy-board-summary">{post.summary}</span>}<span className="cy-board-date">{post.date}</span></span></a></li>)}</ul>)}
  </div>;
}
