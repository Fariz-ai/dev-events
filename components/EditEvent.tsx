/** @format */

"use client";

import { IEvent } from "@/database";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditEvent = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    overview: "",
    image: "",
    venue: "",
    location: "",
    date: "",
    time: "",
    mode: "",
    audience: "",
    organizer: "",
    tags: [] as string[],
    agenda: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [agendaInput, setAgendaInput] = useState("");

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/events/${slug}`);

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await response.json();

        if (data.success && data.event) {
          setEvent(data.event);
          // Pre-populate form
          setFormData({
            title: data.event.title || "",
            description: data.event.description || "",
            overview: data.event.overview || "",
            image: data.event.image || "",
            venue: data.event.venue || "",
            location: data.event.location || "",
            date: data.event.date || "",
            time: data.event.time || "",
            mode: data.event.mode || "",
            audience: data.event.audience || "",
            organizer: data.event.organizer || "",
            tags: data.event.tags || [],
            agenda: data.event.agenda || [],
          });
          setImagePreview(data.event.image || "");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load event data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle agenda addition
  const handleAddAgenda = () => {
    if (agendaInput.trim() && !formData.agenda.includes(agendaInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        agenda: [...prev.agenda, agendaInput.trim()],
      }));
      setAgendaInput("");
    }
  };

  // Handle agenda removal
  const handleRemoveAgenda = (agendaToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((item) => item !== agendaToRemove),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotification(null);

    try {
      const submitData = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags" || key === "agenda") {
          submitData.append(key, JSON.stringify(value));
        } else if (key !== "image") {
          submitData.append(key, value as string);
        }
      });

      // Add image only if a new one was selected
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const response = await fetch(`/api/events/${slug}`, {
        method: "PUT",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update event");
      }

      // Show success notification
      setNotification({
        type: "success",
        message: "Event updated successfully!",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/events");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update event";
      setError(errorMessage);
      setNotification({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
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

  if (error && !event) {
    return (
      <section className="event-management">
        <div className="flex-center min-h-[60vh] flex-col gap-6">
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 max-w-md">
            <p className="text-red-500 text-center text-lg">{error}</p>
          </div>
          <button
            onClick={() => router.push("/events")}
            className="btn-primary">
            Back to Events
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="event-management">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border animate-slide-in-right ${
            notification.type === "success"
              ? "bg-green-500 text-white border-green-400"
              : "bg-red-500 text-white border-red-400"
          }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {notification.type === "success" ? "✓" : "✕"}
            </span>
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="management-header">
        <h1 className="management-title">Edit Event</h1>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="bg-dark-200 hover:bg-dark-200/80 text-light-100 font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 border border-dark-200">
          Cancel
        </button>
      </div>

      {/* Edit Form */}
      <div className="bg-dark-100 border border-dark-200 rounded-xl p-8 card-shadow max-sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Basic Information Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-primary border-b border-dark-200 pb-3">
              Basic Information
            </h2>

            {/* Title */}
            <div className="form-group">
              <label
                htmlFor="title"
                className="text-light-100 font-semibold mb-2 block">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                placeholder="Enter event title"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label
                htmlFor="description"
                className="text-light-100 font-semibold mb-2 block">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200 resize-none"
                placeholder="Enter event description"
              />
            </div>

            {/* Overview */}
            <div className="form-group">
              <label
                htmlFor="overview"
                className="text-light-100 font-semibold mb-2 block">
                Overview <span className="text-red-500">*</span>
              </label>
              <textarea
                id="overview"
                name="overview"
                value={formData.overview}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200 resize-none"
                placeholder="Enter event overview"
              />
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label
                htmlFor="image"
                className="text-light-100 font-semibold mb-2 block">
                Event Image
              </label>
              <div className="flex gap-6 items-start max-sm:flex-col">
                {imagePreview && (
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-dark-200 shrink-0">
                    <Image
                      src={imagePreview}
                      alt="Event preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-black file:font-semibold file:cursor-pointer hover:file:bg-primary/90"
                  />
                  <p className="text-sm text-light-200 mt-2">
                    Leave empty to keep current image
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Venue & Schedule Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-primary border-b border-dark-200 pb-3">
              Venue & Schedule
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Venue */}
              <div className="form-group">
                <label
                  htmlFor="venue"
                  className="text-light-100 font-semibold mb-2 block">
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                  placeholder="Enter venue name"
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label
                  htmlFor="location"
                  className="text-light-100 font-semibold mb-2 block">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                  placeholder="Enter location"
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label
                  htmlFor="date"
                  className="text-light-100 font-semibold mb-2 block">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Time */}
              <div className="form-group">
                <label
                  htmlFor="time"
                  className="text-light-100 font-semibold mb-2 block">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Mode */}
              <div className="form-group">
                <label
                  htmlFor="mode"
                  className="text-light-100 font-semibold mb-2 block">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200">
                  <option value="">Select mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Audience */}
              <div className="form-group">
                <label
                  htmlFor="audience"
                  className="text-light-100 font-semibold mb-2 block">
                  Audience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                  placeholder="e.g., Developers, Students"
                />
              </div>
            </div>

            {/* Organizer */}
            <div className="form-group">
              <label
                htmlFor="organizer"
                className="text-light-100 font-semibold mb-2 block">
                Organizer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                required
                className="w-full bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                placeholder="Enter organizer name"
              />
            </div>
          </div>

          {/* Tags & Agenda Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-primary border-b border-dark-200 pb-3">
              Tags & Agenda
            </h2>

            {/* Tags */}
            <div className="form-group">
              <label
                htmlFor="tags"
                className="text-light-100 font-semibold mb-2 block">
                Tags <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 mb-3 max-sm:flex-col">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 whitespace-nowrap">
                  Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-dark-200 border border-primary/30 rounded-lg text-light-100 text-sm font-medium">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-500 hover:text-red-400 font-bold text-lg transition-colors">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="form-group">
              <label
                htmlFor="agenda"
                className="text-light-100 font-semibold mb-2 block">
                Agenda <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 mb-3 max-sm:flex-col">
                <input
                  type="text"
                  value={agendaInput}
                  onChange={(e) => setAgendaInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAgenda();
                    }
                  }}
                  className="flex-1 bg-dark-200 border border-dark-200 rounded-lg px-5 py-3.5 text-light-100 focus:border-primary focus:outline-none transition-all duration-200"
                  placeholder="Add an agenda item and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddAgenda}
                  className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 whitespace-nowrap">
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {formData.agenda.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-dark-200 border border-dark-200 rounded-lg hover:border-primary/30 transition-all duration-200">
                    <span className="shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-light-100">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAgenda(item)}
                      className="text-red-500 hover:text-red-400 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-200">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-5">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-5 pt-4 border-t border-dark-200 max-sm:flex-col">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-black font-bold px-8 py-4 rounded-lg transition-all duration-200 text-lg">
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  Updating...
                </span>
              ) : (
                "Update Event"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="flex-1 bg-dark-200 hover:bg-dark-200/80 text-light-100 font-bold px-8 py-4 rounded-lg transition-all duration-200 border border-dark-200 text-lg max-sm:order-first">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditEvent;
