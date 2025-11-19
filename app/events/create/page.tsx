/** @format */

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";

interface FormData {
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  organizer: string;
  tags: string[];
  agenda: string[];
}

interface FormErrors {
  [key: string]: string;
}

const CreateEventPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    overview: "",
    venue: "",
    location: "",
    date: "",
    time: "",
    mode: "",
    audience: "",
    organizer: "",
    tags: [],
    agenda: [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [agendaInput, setAgendaInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle image file change with preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
      if (errors.tags) {
        setErrors((prev) => ({ ...prev, tags: "" }));
      }
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
    const trimmedAgenda = agendaInput.trim();
    if (trimmedAgenda && !formData.agenda.includes(trimmedAgenda)) {
      setFormData((prev) => ({
        ...prev,
        agenda: [...prev.agenda, trimmedAgenda],
      }));
      setAgendaInput("");
      if (errors.agenda) {
        setErrors((prev) => ({ ...prev, agenda: "" }));
      }
    }
  };

  // Handle agenda removal
  const handleRemoveAgenda = (agendaToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((item) => item !== agendaToRemove),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.overview.trim()) {
      newErrors.overview = "Overview is required";
    }

    if (!formData.venue.trim()) {
      newErrors.venue = "Venue is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.date) {
      newErrors.date = "Event date is required";
    }

    if (!formData.time) {
      newErrors.time = "Event time is required";
    }

    if (!formData.mode) {
      newErrors.mode = "Event mode is required";
    }

    if (!formData.audience.trim()) {
      newErrors.audience = "Target audience is required";
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = "Organizer name is required";
    }

    if (!imageFile) {
      newErrors.image = "Event image is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    if (formData.agenda.length === 0) {
      newErrors.agenda = "At least one agenda item is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const submitData = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags" || key === "agenda") {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value as string);
        }
      });

      // Add image
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const response = await fetch("/api/events", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create event");
      }

      // Show success notification
      setNotification({
        type: "success",
        message: "Event created successfully!",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/events");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create event";
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

  return (
    <section className="event-management">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`notification-toast ${notification.type} animate-slide-in-right`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="management-header">
        <h1 className="management-title">Create New Event</h1>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="btn-secondary">
          Cancel
        </button>
      </div>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-grid">
          {/* Event Title */}
          <div className="form-group md:col-span-2">
            <label htmlFor="title" className="form-label">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter event title"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          {/* Event Date */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Event Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="form-input"
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>

          {/* Event Time */}
          <div className="form-group">
            <label htmlFor="time" className="form-label">
              Event Time *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="form-input"
            />
            {errors.time && <p className="form-error">{errors.time}</p>}
          </div>

          {/* Venue */}
          <div className="form-group">
            <label htmlFor="venue" className="form-label">
              Venue *
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter venue name"
            />
            {errors.venue && <p className="form-error">{errors.venue}</p>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              placeholder="City, Country"
            />
            {errors.location && <p className="form-error">{errors.location}</p>}
          </div>

          {/* Event Mode/Type */}
          <div className="form-group">
            <label htmlFor="mode" className="form-label">
              Event Mode *
            </label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              className="form-input">
              <option value="">Select event mode</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {errors.mode && <p className="form-error">{errors.mode}</p>}
          </div>

          {/* Audience */}
          <div className="form-group">
            <label htmlFor="audience" className="form-label">
              Target Audience *
            </label>
            <input
              type="text"
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Developers, Students, Professionals"
            />
            {errors.audience && <p className="form-error">{errors.audience}</p>}
          </div>

          {/* Organizer */}
          <div className="form-group">
            <label htmlFor="organizer" className="form-label">
              Organizer *
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter organizer name"
            />
            {errors.organizer && (
              <p className="form-error">{errors.organizer}</p>
            )}
          </div>

          {/* Overview */}
          <div className="form-group md:col-span-2">
            <label htmlFor="overview" className="form-label">
              Event Overview *
            </label>
            <textarea
              id="overview"
              name="overview"
              value={formData.overview}
              onChange={handleInputChange}
              rows={3}
              className="form-input"
              placeholder="Brief overview of the event"
            />
            {errors.overview && <p className="form-error">{errors.overview}</p>}
          </div>

          {/* Description */}
          <div className="form-group md:col-span-2">
            <label htmlFor="description" className="form-label">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="form-input"
              placeholder="Detailed description of the event"
            />
            {errors.description && (
              <p className="form-error">{errors.description}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="form-group md:col-span-2">
            <label htmlFor="image" className="form-label">
              Event Image/Poster *
            </label>
            <div
              className={`image-preview-container ${
                imagePreview ? "has-image" : ""
              }`}>
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Event preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="image-upload-placeholder">
                  <ImageIcon className="w-12 h-12 text-light-200" />
                  <p className="text-light-200">
                    Click below to upload event image
                  </p>
                  <p className="text-light-200/70 text-xs">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input mt-3"
            />
            {errors.image && <p className="form-error">{errors.image}</p>}
          </div>

          {/* Tags */}
          <div className="form-group md:col-span-2">
            <label htmlFor="tags" className="form-label">
              Tags * (e.g., Workshop, Tech, AI, Web Development)
            </label>
            <div className="flex gap-2">
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
                className="form-input flex-1"
                placeholder="Type a tag and press Enter or click Add"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-primary px-6">
                Add
              </button>
            </div>
            {errors.tags && <p className="form-error">{errors.tags}</p>}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Agenda */}
          <div className="form-group md:col-span-2">
            <label htmlFor="agenda" className="form-label">
              Event Agenda *
            </label>
            <div className="flex gap-2">
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
                className="form-input flex-1"
                placeholder="Add agenda item and press Enter or click Add"
              />
              <button
                type="button"
                onClick={handleAddAgenda}
                className="btn-primary px-6">
                Add
              </button>
            </div>
            {errors.agenda && <p className="form-error">{errors.agenda}</p>}
            {formData.agenda.length > 0 && (
              <div className="space-y-2 mt-3">
                {formData.agenda.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-dark-200 rounded-lg">
                    <span className="flex-1 text-light-100">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAgenda(item)}
                      className="text-red-500 hover:text-red-400 font-semibold">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 mt-8 max-sm:flex-col">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Creating Event..." : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/events")}
            disabled={submitting}
            className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateEventPage;
