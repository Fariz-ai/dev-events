/** @format */

import { Booking, Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Fetch all events
    const events = await Event.find().sort({ createdAt: -1 }).lean();

    // Count bookings for each event
    const eventsWithBookings = await Promise.all(
      events.map(async (event) => {
        const bookingCount = await Booking.countDocuments({
          eventId: event._id,
        });

        return {
          ...event,
          _id: event._id.toString(),
          bookedSpots: bookingCount,
        };
      })
    );

    return NextResponse.json(
      {
        message: "Events with bookings fetched successfully",
        events: eventsWithBookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching events with bookings:", error);
    return NextResponse.json(
      { message: "Events with bookings fetching failed", error },
      { status: 500 }
    );
  }
}
