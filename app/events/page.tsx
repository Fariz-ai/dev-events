/** @format */

"use client";

import { IEvent } from "@/database";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";

interface IEventWithBookings extends IEvent {
  bookedSpots: number;
}

const EventManagement = () => {
  const [events, setEvents] = useState<IEventWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventsPerPage = 10;

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events/bookings");
        const data = await response.json();

        if (data.events) {
          setEvents(data.events);
          setTotalPages(Math.ceil(data.events.length / eventsPerPage));
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle event deletion
  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Filter out deleted event
        const updatedEvents = events.filter((event) => event.slug !== slug);
        setEvents(updatedEvents);

        // Recalculate total pages
        const newTotalPages = Math.ceil(updatedEvents.length / eventsPerPage);
        setTotalPages(newTotalPages);

        // If current page is now empty and not the first page, go back one page
        if (currentPage > 1 && indexOfFirstEvent >= updatedEvents.length) {
          setCurrentPage(currentPage - 1);
        }

        alert("Event deleted successfully");
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("An error occurred while deleting the event");
    }
  };

  // Paginate events
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <section className="event-management">
        <div className="flex-center min-h-[60vh]">
          <p className="text-light-100">Loading events...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-management">
      {/* Header */}
      <div className="management-header">
        <h1 className="management-title">Event Management</h1>
        <Link href="/events/create" className="btn-primary">
          Add New Event
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="table-container">
        <table className="event-table">
          <thead>
            <tr>
              <th>Events</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Booked Spot</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.length > 0 ? (
              currentEvents.map((event) => (
                <tr key={event.slug}>
                  <td>
                    <div className="event-info">
                      <div className="event-logo">
                        <Image
                          src={event.image || "/icons/logo.png"}
                          alt={event.title}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      </div>
                      <span className="event-name">{event.title}</span>
                    </div>
                  </td>
                  <td>{event.location}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.time}</td>
                  <td>
                    <span className="booked-count">{event.bookedSpots}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        href={`/events/${event.slug}/edit`}
                        className="btn-edit">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event.slug)}
                        className="btn-delete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  No events found. Create your first event!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards">
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <div key={event.slug} className="event-mobile-card">
              <div className="card-header">
                <div className="event-info">
                  <div className="event-logo">
                    <Image
                      src={event.image || "/icons/logo.png"}
                      alt={event.title}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </div>
                  <span className="event-name">{event.title}</span>
                </div>
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{event.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{event.time}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booked Spot:</span>
                  <span className="detail-value">{event.bookedSpots}</span>
                </div>
              </div>
              <div className="card-actions">
                <Link href={`/events/${event.slug}/edit`} className="btn-edit">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(event.slug)}
                  className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-light-100">
            No events found. Create your first event!
          </p>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
};

export default EventManagement;
