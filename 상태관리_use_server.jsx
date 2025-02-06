"use server";

import { revalidateTag } from "next/cache";
import BookEdit from "./BookEdit";

async function fetchBooks() {
  const res = await fetch("http://localhost:3000/api/books", {
    next: { tags: ["books-query"] },
  });
  return res.json();
}

export default async function Books() {
  const { books } = await fetchBooks();

  return (
    <div>
      {books.map((book) => (
        <BookEdit key={book.id} book={book} />
      ))}
    </div>
  );
}

export async function updateBook(id: number, title: string) {
  await fetch("http://localhost:3000/api/books/update", {
    method: "POST",
    body: JSON.stringify({ id, title }),
  });
  revalidateTag("books-query"); // 캐시 무효화로 서버 상태 새로고침
}
