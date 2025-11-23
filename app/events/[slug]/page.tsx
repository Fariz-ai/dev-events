/** @format */

import { Suspense } from "react";
import EventDetail from "@/components/EventDetail";

function EventDetailLoadingSkeleton() {
  return (
    <section id="event">
      <div className="header">
        <div className="h-8 w-64 bg-dark-200 animate-pulse rounded" />
        <div className="h-20 w-full bg-dark-200 animate-pulse rounded mt-4" />
      </div>
      <div className="flex-center min-h-[60vh]">
        <p className="text-light-100 text-lg">Loading event details...</p>
      </div>
    </section>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<EventDetailLoadingSkeleton />}>
      <EventDetail params={params} />
    </Suspense>
  );
}
