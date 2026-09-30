"use client";
import { useEffect, useState } from "react";
import { deleteOwnPost, subscribeWriter, type CommunityKind } from "@/lib/firebase";
export function useWriter() {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => subscribeWriter(setUid), []);
  return uid;
}
export default function DeletePostButton({ kind, id }: { kind: CommunityKind | "guestbook"; id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function remove() {
    if (busy) return;
    setBusy(true); setError(false);
    try { await deleteOwnPost(kind, id); }
    catch { setError(true); setBusy(false); }
  }
  return <span className="cy-delete-control">
    {!confirming ? <button type="button" className="cy-delete-button" onClick={() => setConfirming(true)}>삭제</button> : <>
      <span>이 글을 삭제할까요?</span>
      <button type="button" className="cy-delete-confirm" disabled={busy} onClick={() => void remove()}>{busy ? "삭제 중…" : "삭제하기"}</button>
      <button type="button" className="cy-delete-button" disabled={busy} onClick={() => { setConfirming(false); setError(false); }}>취소</button>
    </>}
    {error && <span role="alert" className="cy-write-error">삭제하지 못했어요. 작성한 브라우저인지 확인하고 다시 시도해 주세요.</span>}
  </span>;
}
