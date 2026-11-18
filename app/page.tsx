import { HomeView } from "@/components/review-views";
import { getAllBookReviews } from "@/lib/mdx";

export default async function Home() {
  return <HomeView reviews={await getAllBookReviews()} />;
}
