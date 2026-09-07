"use client";
import { useActionState, useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { deleteLink } from "@/app/dashboard/actions";
export function CopyButton({ url }: { url: string }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Copied!");
    } catch {
      setStatus("Copy failed. Select and copy the short URL.");
    }
    setTimeout(() => setStatus(""), 3000);
  }
  return (
    <span className="copy-wrap">
      <button
        type="button"
        className="icon-button"
        onClick={copy}
        aria-label="Copy short link"
        title="Copy short link"
      >
        {status === "Copied!" ? <Check size={16} /> : <Copy size={16} />}
      </button>
      {status && (
        <span className="copy-feedback" role="status">
          {status}
        </span>
      )}
    </span>
  );
}
export function DeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(
    deleteLink.bind(null, id),
    {},
  );
  return (
    <div>
      {!confirming ? (
        <button
          type="button"
          className="button danger"
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={16} />
          Delete link
        </button>
      ) : (
        <form action={action} className="delete-confirm">
          <p>This permanently deletes the link and all its click history.</p>
          <div className="button-row">
            <button className="button danger" disabled={pending}>
              {pending ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {state.error && (
        <p className="notice error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="notice success" role="status">
          {state.success}
        </p>
      )}
    </div>
  );
}
