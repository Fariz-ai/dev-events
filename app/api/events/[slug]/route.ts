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
 * PUT /api/events/[slug]
 * Updates an event by its slug
 */
export async function PUT(
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

    // Find the event first
    const existingEvent = await Event.findOne({ slug: sanitizedSlug });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Parse the form data
    const formData = await request.formData();
    const updateData: Record<string, string | string[]> = {};

    // Extract all fields except image (handle separately)
    const fields = [
      "title",
      "description",
      "overview",
      "venue",
      "location",
      "date",
      "time",
      "mode",
      "audience",
      "organizer",
    ];

    fields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null && value !== undefined && typeof value === "string") {
        updateData[field] = value;
      }
    });

    // Parse tags and agenda if provided
    const tagsValue = formData.get("tags");
    if (tagsValue) {
      try {
        updateData.tags = JSON.parse(tagsValue as string);
      } catch {
        return NextResponse.json(
          { error: "Invalid tags format" },
          { status: 400 }
        );
      }
    }

    const agendaValue = formData.get("agenda");
    if (agendaValue) {
      try {
        updateData.agenda = JSON.parse(agendaValue as string);
      } catch {
        return NextResponse.json(
          { error: "Invalid agenda format" },
          { status: 400 }
        );
      }
    }

    // Handle image upload if a new image is provided
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const { v2: cloudinary } = await import("cloudinary");
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "image", folder: "DevEvent" },
              (error, results) => {
                if (error) return reject(error);
                resolve(results as { secure_url: string });
              }
            )
            .end(buffer);
        }
      );

      updateData.image = uploadResult.secure_url;
    }

    // Update the event
    const updatedEvent = await Event.findOneAndUpdate(
      { slug: sanitizedSlug },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Event updated successfully",
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event:", error);

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

      // Handle validation errors
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { error: "Validation failed", details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the event" },
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
