/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking, Event } from "@/database";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { error: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Sanitize slug: trim whitespace and convert to lowercase
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query event by slug with error handling
    const event = await Event.findOne({
      slug: sanitizedSlug,
    }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Return event data
    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching event by slug:", error);

    // Check for specific database errors
    if (error instanceof Error) {
      // Handle MongoDB connection errors
      if (
        error.message.includes("connection") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }

      // Handle MongoDB query errors
      if (error.name === "CastError" || error.name === "ValidationError") {
        return NextResponse.json(
          { error: "Invalid query parameter" },
          { status: 400 }
        );
      }
    }

    // Return generic error message to client
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[slug]
 * Deletes an event by its slug and all related bookings
 */
export async function DELETE(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { error: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Sanitize slug: trim whitespace and convert to lowercase
    const sanitizedSlug = slug.trim().toLowerCase();

    // Find event first to get its _id
    const event = await Event.findOne({ slug: sanitizedSlug });

    // Handle event not found
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete all bookings related to this event first
    const deletedBookings = await Booking.deleteMany({
      eventId: event._id,
    });

    // Delete the event
    await Event.findByIdAndDelete(event._id);

    // Return success message with deletion count
    return NextResponse.json(
      {
        success: true,
        message: "Event and related bookings deleted successfully",
        deletedBookingsCount: deletedBookings.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting event by slug:", error);

    // Check for specific database errors
    if (error instanceof Error) {
      // Handle MongoDB connection errors
      if (
        error.message.includes("connection") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }

      // Handle MongoDB query errors
      if (error.name === "CastError" || error.name === "ValidationError") {
        return NextResponse.json(
          { error: "Invalid query parameter" },
          { status: 400 }
        );
      }
    }

    // Return generic error message to client
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting the event" },
      { status: 500 }
    );
  }
}
