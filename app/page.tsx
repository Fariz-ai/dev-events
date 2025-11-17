/** @format */

"use client";

import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import Pagination from "@/components/Pagination";
import { IEvent } from "@/database";
import { useEffect, useState } from "react";

const Page = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6; // Show 6 events per page (2 rows of 3)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events");
        const data = await response.json();

        if (data.events) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of events section when page changes
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev
        <br />
        Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        {loading ? (
          <div className="flex-center min-h-[400px]">
            <p className="text-light-100">Loading events...</p>
          </div>
        ) : currentEvents.length > 0 ? (
          <>
            <ul className="events">
              {currentEvents.map((event: IEvent) => (
                <li key={event.slug} className="list-none">
                  <EventCard {...event} />
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="flex-center min-h-[400px]">
            <p className="text-light-200 text-center">
              No events available at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;
