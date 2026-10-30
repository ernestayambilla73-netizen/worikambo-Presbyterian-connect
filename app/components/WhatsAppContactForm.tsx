"use client";

import { useState } from "react";

export default function WhatsAppContactForm({ phone }: { phone: string }) {
  const [status, setStatus] = useState("");
  const digits = phone.replace(/\\D/g, "");
  const whatsappNumber = digits.startsWith("0") ? "233" + digits.slice(1) : digits;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!whatsappNumber) {
      setStatus("The church WhatsApp contact has not been configured. Please use the contact details shown by your congregation.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const message = [
      "Peace Congregation website enquiry",
      "Name: " + String(form.get("name") || ""),
      "Contact: " + String(form.get("contact") || ""),
      "Topic: " + String(form.get("topic") || "General enquiry"),
      "Message: " + String(form.get("message") || ""),
    ].join("\\n");
    const url = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener,noreferrer");
    setStatus("WhatsApp has opened with your message. Review it and tap Send to contact the church.");
  }

  return (
    <form className="form-card contact-whatsapp-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="contact-name">Your name</label>
          <input id="contact-name" name="name" placeholder="Full name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="contact-detail">Email or phone</label>
          <input id="contact-detail" name="contact" placeholder="How the church can reach you" autoComplete="email" required />
        </div>
        <div className="field field-full">
          <label htmlFor="contact-topic">Reason for contacting</label>
          <select id="contact-topic" name="topic" defaultValue="General enquiry">
            <option>General enquiry</option>
            <option>Congregation information</option>
            <option>Prayer request</option>
            <option>News submission</option>
            <option>Programme information</option>
          </select>
        </div>
        <div className="field field-full">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" placeholder="How can we help?" required />
        </div>
      </div>
      <button className="btn" type="submit" disabled={!whatsappNumber}>Continue to WhatsApp</button>
      <p className="small">Your message opens in WhatsApp. Check the details and tap Send. The website does not store this message.</p>
      {status && <p className="admin-success" role="status" aria-live="polite">{status}</p>}
      {!whatsappNumber && <p className="admin-error" role="alert">The church contact number is not currently configured.</p>}
    </form>
  );
}
