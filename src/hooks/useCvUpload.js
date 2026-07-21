import { useCallback, useRef, useState } from 'react';

// Mirrors MAX_CV_BYTES in api/_lib/sanitize.js. The server enforces this for
// real — these exist only so the user is told before a 4MB upload, and so the
// ceiling is written down once for both the free CV review and the checkout.
export const MAX_CV_MB = 3;
export const MAX_CV_BYTES = MAX_CV_MB * 1024 * 1024;

// Must stay in step with ACCEPTED in api/_lib/sanitize.js. The server also
// checks the file's leading bytes, so a renamed .txt is rejected there even
// though this list lets it through.
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * File-picker state for a CV drop zone: selection, drag-and-drop, client-side
 * type and size checks, and base64 encoding for the JSON POST.
 *
 * `onError` receives a message to show, or null to clear it — the caller owns
 * its own error state so the message can sit alongside its other field errors.
 */
export function useCvUpload(onError) {
  const [cvFile, setCvFile] = useState(null);
  const inputRef = useRef(null);

  const selectFile = useCallback(
    (file) => {
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError('Please upload a PDF or Word document');
        return;
      }
      if (file.size > MAX_CV_BYTES) {
        onError(`File must be under ${MAX_CV_MB}MB`);
        return;
      }
      setCvFile(file);
      onError(null);
    },
    [onError]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) selectFile(file);
    },
    [selectFile]
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);
  const clearFile = useCallback(() => setCvFile(null), []);

  /** Read the selected file as bare base64, without the data: URL prefix. */
  const toBase64 = useCallback(() => {
    if (!cvFile) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(cvFile);
    });
  }, [cvFile]);

  return { cvFile, inputRef, selectFile, handleDrop, openPicker, clearFile, toBase64 };
}
