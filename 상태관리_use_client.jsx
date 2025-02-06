"use client";

import { useState, useTransition } from "react";
import { updateBook } from "./Books";

export default function BookEdit({ book }) {
  const [title, setTitle] = useState(book.title);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(() => {
      updateBook(book.id, title); // 서버 액션 호출
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-1 rounded"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="bg-blue-500 text-white p-1 rounded"
      >
        {isPending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
