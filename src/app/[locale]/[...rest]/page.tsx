import { notFound } from "next/navigation";

// Любой несуществующий адрес → страница 404 в оформлении сайта.
export const instant = false;

export default function CatchAll() {
  notFound();
}
