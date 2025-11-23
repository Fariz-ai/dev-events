/** @format */

import { Suspense } from "react";
import EditEvent from "@/components/EditEvent";

function EditEventLoadingSkeleton() {
  return (
    <section className="event-management">
      <div className="flex-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-light-100 text-lg">Loading event data...</p>
        </div>
      </div>
    </section>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<EditEventLoadingSkeleton />}>
      <EditEvent />
    </Suspense>
  );
}
