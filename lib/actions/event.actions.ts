/** @format */

"use server";

import { Event } from "@/database";
import connectDB from "../mongodb";
import { IEventBase } from "@/database/event.model";

export const getSimilarEventBySlug = async (slug: string): Promise<IEventBase[]> => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });

    return await Event.find({
      _id: { $ne: event?._id },
      tags: { $in: event?.tags },
    }).lean();
  } catch {
    return [];
  }
};
