/**
 * Safely copies plain text to the system clipboard across restricted and legacy browsers.
 * Never throws or rejects on permission errors (SecurityError / NotAllowedError).
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  let copied = false;

  if (typeof navigator !== "undefined") {
    try {
      const clipboard = navigator.clipboard;
      if (clipboard && typeof clipboard.writeText === "function") {
        await clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }
  }

  if (!copied && typeof document !== "undefined" && document.body) {
    let textarea: HTMLTextAreaElement | null = null;
    try {
      textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "0";
      textarea.style.top = "0";
      textarea.style.width = "1px";
      textarea.style.height = "1px";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      try {
        textarea.focus({ preventScroll: true });
      } catch {
        // ignore focus failures in restricted contexts
      }
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    } finally {
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }
  }

  return copied;
}
