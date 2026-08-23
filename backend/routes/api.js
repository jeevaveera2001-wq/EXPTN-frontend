import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import { OAuth2Client } from "google-auth-library";

import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Property } from "../models/Property.js";
import { Booking } from "../models/Booking.js";
import { Vehicle } from "../models/Vehicle.js";
import { Ticket } from "../models/Ticket.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'explore_tamilnadu_enterprise_jwt_secret_key_2026_super_secure';
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "";

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID
);

// -------------------------------------------------------
// DATABASE CONNECTION RECOVERY
// -------------------------------------------------------

// The main server should connect to MongoDB during startup.
// This middleware only starts a background reconnect if the
// database connection is unexpectedly lost.
//
// It does not make every request wait for connectDB().
let reconnectPromise = null;

router.use((req, res, next) => {
  if (
    mongoose.connection.readyState === 0 &&
    !reconnectPromise
  ) {
    reconnectPromise = connectDB()
      .catch((error) => {
        console.error(
          "MongoDB background reconnect failed:",
          error.message
        );
      })
      .finally(() => {
        reconnectPromise = null;
      });
  }

  next();
});

// -------------------------------------------------------
// TOKEN GENERATOR
// -------------------------------------------------------

const generateToken = (id) => {
  const secret = JWT_SECRET || process.env.JWT_SECRET || 'explore_tamilnadu_enterprise_jwt_secret_key_2026_super_secure';
  return jwt.sign(
    { id: String(id) },
    secret,
    {
      expiresIn: "30d",
    }
  );
};

// -------------------------------------------------------
// IN-MEMORY FALLBACK STORES
// -------------------------------------------------------

const memoryUsers = new Map();
const memoryProperties = [];
const memoryVehicles = [];
const memoryTickets = [];
const memoryBookings = [];

// -------------------------------------------------------
// SYSTEM MAINTENANCE STATE
// -------------------------------------------------------

let systemMaintenanceState = {
  isMaintenance: false,

  message:
    "Explore Tamil Nadu is undergoing scheduled " +
    "system upgrades for high-speed performance, " +
    "live database caching, and enhanced " +
    "reservation security.",

  estimatedTime: "30 Minutes",

  upgradeTitle:
    "Platform Upgrade & Performance " +
    "Optimization in Progress",

  updatedAt: new Date(),
};

// -------------------------------------------------------
// IMAGE SANITIZERS & DEFAULT CDN CONSTANTS
// -------------------------------------------------------

const DEFAULT_HOTEL_IMG = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';
const DEFAULT_VEHICLE_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';
const DEFAULT_AVATAR_IMG = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const PROPERTY_TYPE_IMAGES = {
  resort: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  ],
  homestay: [
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  ],
  cottage: [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
  ],
};

const getPropertyImages = (prop) => {
  const t = String(prop?.type || prop?.title || '').toLowerCase();
  if (t.includes('resort')) return PROPERTY_TYPE_IMAGES.resort;
  if (t.includes('home')) return PROPERTY_TYPE_IMAGES.homestay;
  if (t.includes('villa')) return PROPERTY_TYPE_IMAGES.villa;
  if (t.includes('cottage')) return PROPERTY_TYPE_IMAGES.cottage;
  return PROPERTY_TYPE_IMAGES.hotel;
};

const VEHICLE_TYPE_IMAGES = {
  suv: [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  ],
  sedan: [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  ],
  luxury: [
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
  ],
  tempo: [
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  ],
};

const getVehicleImages = (veh) => {
  const t = String(veh?.type || veh?.title || '').toLowerCase();
  if (t.includes('suv') || t.includes('innova') || t.includes('scorpio')) return VEHICLE_TYPE_IMAGES.suv;
  if (t.includes('luxury') || t.includes('bmw') || t.includes('audi') || t.includes('mercedes')) return VEHICLE_TYPE_IMAGES.luxury;
  if (t.includes('tempo') || t.includes('bus') || t.includes('van') || t.includes('traveller')) return VEHICLE_TYPE_IMAGES.tempo;
  return VEHICLE_TYPE_IMAGES.sedan;
};

const sanitizeImageUrl = (img, fallback = DEFAULT_HOTEL_IMG) => {
  if (!img || typeof img !== 'string') return fallback;
  const trimmed = img.trim();
  if (trimmed.startsWith('data:image/') || trimmed.length > 1000) return fallback;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) return fallback;
  return trimmed;
};

const sanitizeImages = (images, fallback = DEFAULT_HOTEL_IMG) => {
  if (!Array.isArray(images) || images.length === 0) return [fallback];
  const cleaned = images.map(img => {
    const raw = typeof img === 'string' ? img : img?.url;
    return sanitizeImageUrl(raw, fallback);
  }).filter(Boolean);
  return cleaned.length > 0 ? cleaned.slice(0, 5) : [fallback];
};

// -------------------------------------------------------
// SOCKET EVENT BROADCASTER
// -------------------------------------------------------

const broadcast = (
  req,
  event,
  data
) => {
  try {
    const io = req?.app?.get("io");

    if (io) {
      io.emit(event, data);
    }
  } catch (error) {
    console.warn(
      "Socket broadcast warning:",
      error.message
    );
  }
};

// -------------------------------------------------------
// FIND USER BY EMAIL
// -------------------------------------------------------

const findUserByEmail = async (
  email
) => {
  if (!email) {
    return null;
  }

  const normalized = String(email)
    .toLowerCase()
    .trim();

  try {
    if (
      mongoose.connection.readyState === 1
    ) {
      const user = await User.findOne({
        email: normalized,
      })
        .select(
          "_id name email phone avatar " +
          "role isVerified password"
        )
        .lean()
        .maxTimeMS(3000);

      if (user) {
        return user;
      }
    }
  } catch (error) {
    console.error(
      "Find user by email failed:",
      error.message
    );
  }

  for (
    const [storedEmail, user]
    of memoryUsers.entries()
  ) {
    if (
      storedEmail.toLowerCase() ===
      normalized
    ) {
      return user;
    }
  }

  return null;
};

// -------------------------------------------------------
// GMAIL TRANSPORTER
// -------------------------------------------------------

const getGmailTransporter = () => {
  const user = String(
    process.env.SMTP_EMAIL || ""
  ).trim();

  const pass = String(
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASSWORD ||
    ""
  ).replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error(
      "SMTP_EMAIL and GMAIL_APP_PASSWORD " +
      "must be configured"
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
      user,
      pass,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,

    tls: {
      rejectUnauthorized: true,
    },
  });
};

// -------------------------------------------------------
// GENERIC EMAIL DISPATCHER
// -------------------------------------------------------

const sendDirectMail = async ({
  to,
  subject,
  html,
}) => {
  if (!to) {
    return null;
  }

  const normalizedTo = String(to)
    .trim()
    .toLowerCase();

  if (
    !normalizedTo ||
    !normalizedTo.includes("@")
  ) {
    return null;
  }

  const smtpUser = String(
    process.env.SMTP_EMAIL || ""
  ).trim();

  // Primary email method: Gmail SMTP
  if (
    smtpUser &&
    (
      process.env.GMAIL_APP_PASSWORD ||
      process.env.SMTP_PASSWORD
    )
  ) {
    try {
      const transporter =
        getGmailTransporter();

      const info =
        await transporter.sendMail({
          from:
            `"Explore Tamil Nadu Official" ` +
            `<${smtpUser}>`,

          to: normalizedTo,
          subject,
          html,
        });

      console.log(
        "Email delivered successfully:",
        info.messageId
      );

      return info;
    } catch (smtpError) {
      console.warn(
        "Gmail SMTP delivery failed:",
        smtpError.message
      );
    }
  }

  // Secondary email method:
  // Google Apps Script webhook
  const googleScriptUrl = String(
    process.env
      .GOOGLE_SCRIPT_MAIL_URL || ""
  ).trim();

  if (googleScriptUrl) {
    try {
      const controller =
        new AbortController();

      const timeoutId = setTimeout(
        () => controller.abort(),
        15000
      );

      try {
        const response = await fetch(
          googleScriptUrl,
          {
            method: "POST",
            redirect: "follow",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8",
            },

            body: JSON.stringify({
              to: normalizedTo,
              subject,
              html,
            }),

            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Webhook returned ${response.status}`
          );
        }

        const result =
          await response.text();

        console.log(
          "Email delivered through webhook"
        );

        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (webhookError) {
      console.error(
        "Email webhook failed:",
        webhookError.message
      );
    }
  }

  console.error(
    "No email delivery method succeeded"
  );

  return null;
};

// -------------------------------------------------------
// AUTHENTICATION OTP EMAIL
// -------------------------------------------------------

const sendVerificationMail = async (
  toEmail,
  recipientName,
  code
) => {
  const safeRecipientName =
    recipientName || "Traveler";

  const mailHtml = `
    <div
      style="
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          sans-serif;
        max-width: 560px;
        margin: 0 auto;
        background-color: #f9f5f2;
        padding: 32px;
        border-radius: 16px;
        border: 1px solid #242429;
      "
    >
      <div
        style="
          text-align: center;
          margin-bottom: 24px;
        "
      >
        <h1
          style="
            color: #070707;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
          "
        >
          Explore Tamil Nadu
        </h1>

        <p
          style="
            color: #919191;
            font-size: 11px;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 6px;
          "
        >
          Authentic Stays & Tourism Platform
        </p>
      </div>

      <div
        style="
          background-color: #ffffff;
          padding: 28px;
          border-radius: 12px;
          border:
            1px solid rgba(36,36,41,0.15);
          text-align: center;
        "
      >
        <h2
          style="
            color: #242429;
            font-size: 18px;
            font-weight: 700;
            margin-top: 0;
          "
        >
          Email Verification Required
        </h2>

        <p
          style="
            color: #3e3e3e;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 20px;
          "
        >
          Hello
          <strong>
            ${safeRecipientName}
          </strong>,
          welcome to Explore Tamil Nadu.
          Use the following six-digit code to
          verify your email address.
        </p>

        <div
          style="
            display: inline-block;
            background-color: #242429;
            color: #ffffff;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 8px;
            padding: 14px 28px;
            border-radius: 10px;
            font-family: monospace;
            margin: 8px 0 20px 0;
          "
        >
          ${code}
        </div>

        <p
          style="
            color: #919191;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
          "
        >
          This verification code is valid
          for 15 minutes. If you did not
          request this verification, you can
          safely ignore this email.
        </p>
      </div>

      <div
        style="
          text-align: center;
          margin-top: 24px;
          color: #919191;
          font-size: 11px;
          font-family: monospace;
        "
      >
        &copy; 2026 Explore Tamil Nadu
        Tourism Portal
      </div>
    </div>
  `;

  await sendDirectMail({
    to: toEmail,

    subject:
      `Your 6-Digit Verification Code: ` +
      `${code} - Explore Tamil Nadu`,

    html: mailHtml,
  });
};
// -------------------------------------------------------
// EMAIL HTML HELPERS
// -------------------------------------------------------

const escapeHtml = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

const createEmailLayout = ({
  title,
  subtitle,
  content,
}) => {
  return `
    <div
      style="
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Arial,
          sans-serif;
        max-width: 620px;
        margin: 0 auto;
        padding: 30px;
        background: #f9f5f2;
        border: 1px solid #242429;
        border-radius: 18px;
      "
    >
      <div
        style="
          text-align: center;
          margin-bottom: 22px;
        "
      >
        <h1
          style="
            margin: 0;
            color: #070707;
            font-size: 25px;
            font-weight: 900;
          "
        >
          Explore Tamil Nadu
        </h1>

        <p
          style="
            margin: 6px 0 0;
            color: #777777;
            font-family: monospace;
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          "
        >
          ${escapeHtml(subtitle)}
        </p>
      </div>

      <div
        style="
          padding: 27px;
          background: #ffffff;
          border:
            1px solid rgba(36,36,41,0.14);
          border-radius: 14px;
        "
      >
        <h2
          style="
            margin: 0 0 18px;
            color: #111827;
            font-size: 20px;
            text-align: center;
          "
        >
          ${escapeHtml(title)}
        </h2>

        ${content}
      </div>

      <p
        style="
          margin: 22px 0 0;
          color: #8b8b8b;
          text-align: center;
          font-family: monospace;
          font-size: 11px;
        "
      >
        &copy; 2026 Explore Tamil Nadu
        Reservations Platform
        <br />
        Support: +91 78717 79134
      </p>
    </div>
  `;
};

const createInformationRow = (
  label,
  value,
  options = {}
) => {
  const color =
    options.color || "#111827";

  return `
    <tr>
      <td
        style="
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
          font-weight: 700;
          vertical-align: top;
        "
      >
        ${escapeHtml(label)}
      </td>

      <td
        style="
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
          color: ${color};
          font-size: 12px;
          font-weight: 800;
          text-align: right;
          vertical-align: top;
        "
      >
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
};

// -------------------------------------------------------
// NORMALIZE BOOKING INFORMATION
// -------------------------------------------------------

const getBookingInformation = (
  booking
) => {
  const customerEmail = String(
    booking.customerEmail ||
    booking.userEmail ||
    booking.email ||
    ""
  )
    .trim()
    .toLowerCase();

  const vendorEmail = String(
    booking.ownerEmail ||
    booking.providerEmail ||
    booking.hostEmail ||
    ""
  )
    .trim()
    .toLowerCase();

  const adminEmail = String(
    process.env.ADMIN_EMAIL ||
    "exploretamizhagam@gmail.com"
  )
    .trim()
    .toLowerCase();

  const isCab = Boolean(
    booking.type === "cab" ||
    booking.itemType === "vehicle" ||
    booking.bookingType === "cab" ||
    booking.vehicleRegNo ||
    booking.regNo ||
    booking.pickupLocation
  );

  const title =
    booking.itemTitle ||
    booking.propertyTitle ||
    booking.title ||
    (
      isCab
        ? "Cab Transport"
        : "Resort Stay"
    );

  const bookingId =
    booking.bookingId ||
    booking._id ||
    booking.id ||
    "Booking Reference";

  const customerName =
    booking.customerName ||
    booking.userName ||
    booking.name ||
    "Traveler";

  const totalAmount = Number(
    booking.totalAmount ||
    booking.amount ||
    0
  );

  return {
    customerEmail,
    vendorEmail,
    adminEmail,
    isCab,
    title,
    bookingId,
    customerName,
    totalAmount,
  };
};

const createBookingDetailsTable = (
  booking,
  information
) => {
  const {
    isCab,
    title,
    totalAmount,
  } = information;

  let rows = "";

  if (isCab) {
    rows += createInformationRow(
      "Vehicle / Cab",
      `${title} (${
        booking.vehicleRegNo ||
        booking.regNo ||
        "Assigned Fleet"
      })`
    );

    rows += createInformationRow(
      "Pickup and Drop",
      `${
        booking.pickupLocation ||
        "Pickup location"
      } → ${
        booking.dropLocation ||
        "Destination"
      }`
    );

    rows += createInformationRow(
      "Pickup Schedule",
      `${
        booking.pickupDate ||
        booking.checkIn ||
        booking.checkInDate ||
        "Scheduled date"
      } at ${
        booking.pickupTime ||
        "09:00 AM"
      }`
    );

    rows += createInformationRow(
      "Driver",
      `${
        booking.driverName ||
        "Driver will be assigned"
      } ${
        booking.driverPhone
          ? `(${booking.driverPhone})`
          : ""
      }`
    );

    rows += createInformationRow(
      "Passengers",
      `${
        booking.passengerCount ||
        booking.guests ||
        1
      } passenger(s)`
    );
  } else {
    rows += createInformationRow(
      "Property / Stay",
      title
    );

    rows += createInformationRow(
      "Location",
      booking.destination ||
      booking.location ||
      "Tamil Nadu"
    );

    rows += createInformationRow(
      "Check-in",
      booking.checkIn ||
      booking.checkInDate ||
      "Selected date"
    );

    rows += createInformationRow(
      "Check-out",
      booking.checkOut ||
      booking.checkOutDate ||
      "Selected date"
    );

    rows += createInformationRow(
      "Guests",
      `${
        booking.guests ||
        booking.guestCount ||
        1
      } guest(s)`
    );

    rows += createInformationRow(
      "Nights",
      `${
        booking.nights || 1
      } night(s)`
    );
  }

  rows += createInformationRow(
    "Payment ID",
    booking.paymentId ||
    booking.razorpayPaymentId ||
    "Pending payment reference",
    {
      color: "#0284c7",
    }
  );

  rows += createInformationRow(
    "Total Amount",
    `₹${formatCurrency(totalAmount)}`,
    {
      color: "#059669",
    }
  );

  return `
    <table
      style="
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-family: monospace;
      "
    >
      ${rows}
    </table>
  `;
};

// -------------------------------------------------------
// BOOKING PENDING EMAIL
// -------------------------------------------------------

const sendBookingPendingMail = async (
  booking
) => {
  const information =
    getBookingInformation(booking);

  const {
    customerEmail,
    vendorEmail,
    adminEmail,
    isCab,
    title,
    bookingId,
    customerName,
    totalAmount,
  } = information;

  const detailsTable =
    createBookingDetailsTable(
      booking,
      information
    );

  const customerContent = `
    <div style="text-align: center;">
      <span
        style="
          display: inline-block;
          padding: 7px 15px;
          color: #92400e;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 20px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 900;
        "
      >
        PENDING HOST CONFIRMATION
      </span>
    </div>

    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
        text-align: center;
      "
    >
      Hello
      <strong>
        ${escapeHtml(customerName)}
      </strong>,
      your booking request has been received.
      The provider is checking availability
      for your selected schedule.
    </p>

    <p
      style="
        color: #111827;
        font-size: 13px;
        text-align: center;
      "
    >
      Booking reference:
      <strong>
        ${escapeHtml(bookingId)}
      </strong>
    </p>

    ${detailsTable}

    <div
      style="
        margin-top: 20px;
        padding: 14px;
        color: #334155;
        background: #f8fafc;
        border-left: 4px solid #f59e0b;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.6;
      "
    >
      You will receive another email when
      the provider confirms your booking.
    </div>
  `;

  if (customerEmail) {
    await sendDirectMail({
      to: customerEmail,

      subject:
        `Booking Request Received: ` +
        `${bookingId} - ${title}`,

      html: createEmailLayout({
        title: "Booking Request Received",

        subtitle:
          isCab
            ? "Cab Transport Booking"
            : "Stay Reservation",

        content: customerContent,
      }),
    });
  }

  const providerContent = `
    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      A new ${
        isCab
          ? "cab booking"
          : "stay reservation"
      } requires review.
    </p>

    <p>
      <strong>Booking ID:</strong>
      ${escapeHtml(bookingId)}
    </p>

    <p>
      <strong>Customer:</strong>
      ${escapeHtml(customerName)}
    </p>

    <p>
      <strong>Customer Email:</strong>
      ${escapeHtml(customerEmail)}
    </p>

    <p>
      <strong>Total Amount:</strong>
      ₹${formatCurrency(totalAmount)}
    </p>

    ${detailsTable}

    <p
      style="
        margin-top: 20px;
        color: #92400e;
        font-weight: 800;
      "
    >
      Log in to the dashboard to confirm
      or reject this request.
    </p>
  `;

  const recipients = [
    ...new Set(
      [
        vendorEmail,
        adminEmail,
      ].filter(Boolean)
    ),
  ];

  for (
    const recipient
    of recipients
  ) {
    await sendDirectMail({
      to: recipient,

      subject:
        `Action Required: Booking ` +
        `${bookingId} for ${title}`,

      html: createEmailLayout({
        title: "New Booking Awaiting Review",
        subtitle: "Provider Notification",
        content: providerContent,
      }),
    });
  }
};

// -------------------------------------------------------
// BOOKING CONFIRMED EMAIL
// -------------------------------------------------------

const sendBookingConfirmedMail = async (
  booking
) => {
  const information =
    getBookingInformation(booking);

  const {
    customerEmail,
    vendorEmail,
    adminEmail,
    isCab,
    title,
    bookingId,
    customerName,
  } = information;

  const detailsTable =
    createBookingDetailsTable(
      booking,
      information
    );

  const guestContent = `
    <div style="text-align: center;">
      <span
        style="
          display: inline-block;
          padding: 8px 17px;
          color: #065f46;
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          border-radius: 20px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 900;
        "
      >
        OFFICIAL BOOKING CONFIRMED
      </span>
    </div>

    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
        text-align: center;
      "
    >
      Dear
      <strong>
        ${escapeHtml(customerName)}
      </strong>,
      your ${
        isCab
          ? "cab booking"
          : "stay reservation"
      } has been officially confirmed.
    </p>

    <div
      style="
        margin: 20px 0;
        padding: 18px;
        text-align: center;
        background: #f8fafc;
        border: 2px dashed #059669;
        border-radius: 12px;
      "
    >
      <div
        style="
          color: #64748b;
          font-family: monospace;
          font-size: 10px;
          font-weight: 800;
        "
      >
        BOOKING REFERENCE
      </div>

      <div
        style="
          margin-top: 6px;
          color: #0f172a;
          font-family: monospace;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: 1px;
        "
      >
        ${escapeHtml(bookingId)}
      </div>
    </div>

    ${detailsTable}

    <div
      style="
        margin-top: 22px;
        text-align: center;
      "
    >
      <a
        href="${
          process.env.FRONTEND_URL ||
          "https://frontend-blond-iota-kzel6q4tzd.vercel.app"
        }/dashboard/user"
        style="
          display: inline-block;
          padding: 12px 23px;
          color: #ffffff;
          background: #242429;
          border-radius: 24px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        "
      >
        Open My Bookings
      </a>
    </div>
  `;

  if (customerEmail) {
    await sendDirectMail({
      to: customerEmail,

      subject:
        `Booking Confirmed: ` +
        `${bookingId} - ${title}`,

      html: createEmailLayout({
        title: title,

        subtitle:
          isCab
            ? "Official Cab Transport Pass"
            : "Official Stay Voucher",

        content: guestContent,
      }),
    });
  }

  const providerContent = `
    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      Booking
      <strong>
        ${escapeHtml(bookingId)}
      </strong>
      has been confirmed successfully.
    </p>

    <p>
      <strong>Customer:</strong>
      ${escapeHtml(customerName)}
    </p>

    <p>
      <strong>Service:</strong>
      ${escapeHtml(title)}
    </p>

    ${detailsTable}
  `;

  const providerRecipients = [
    ...new Set(
      [
        vendorEmail,
        adminEmail,
      ].filter(Boolean)
    ),
  ];

  for (
    const recipient
    of providerRecipients
  ) {
    await sendDirectMail({
      to: recipient,

      subject:
        `Booking Confirmed: ` +
        `${bookingId} - ${title}`,

      html: createEmailLayout({
        title: "Booking Confirmed",
        subtitle: "Provider Confirmation",
        content: providerContent,
      }),
    });
  }
};

// -------------------------------------------------------
// PROPERTY EMAIL HELPERS
// -------------------------------------------------------

const getPropertyInformation = (
  property
) => {
  const ownerEmail = String(
    property.ownerEmail ||
    property.email ||
    property.contactEmail ||
    ""
  )
    .trim()
    .toLowerCase();

  const adminEmail = String(
    process.env.ADMIN_EMAIL ||
    "exploretamizhagam@gmail.com"
  )
    .trim()
    .toLowerCase();

  const title =
    property.title ||
    property.name ||
    property.propertyName ||
    "New Property";

  const ownerName =
    property.ownerName ||
    property.hostName ||
    property.contactName ||
    "Property Partner";

  const location =
    property.location ||
    property.city ||
    property.destination ||
    "Tamil Nadu";

  const propertyType =
    property.propertyType ||
    property.type ||
    "Property";

  const propertyId =
    property._id ||
    property.id ||
    "Pending ID";

  return {
    ownerEmail,
    adminEmail,
    title,
    ownerName,
    location,
    propertyType,
    propertyId,
  };
};

const createPropertyDetails = (
  property
) => {
  const information =
    getPropertyInformation(property);

  const {
    title,
    ownerName,
    location,
    propertyType,
    propertyId,
  } = information;

  return `
    <table
      style="
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
        font-family: monospace;
      "
    >
      ${createInformationRow(
        "Property ID",
        propertyId
      )}

      ${createInformationRow(
        "Property Name",
        title
      )}

      ${createInformationRow(
        "Property Type",
        propertyType
      )}

      ${createInformationRow(
        "Location",
        location
      )}

      ${createInformationRow(
        "Owner / Host",
        ownerName
      )}

      ${createInformationRow(
        "Contact Number",
        property.ownerPhone ||
        property.phone ||
        property.contactPhone ||
        "Not provided"
      )}

      ${createInformationRow(
        "Price Per Night",
        `₹${formatCurrency(
          property.pricePerNight ||
          property.price ||
          0
        )}`,
        {
          color: "#059669",
        }
      )}

      ${createInformationRow(
        "Current Status",
        property.status ||
        "Pending Approval",
        {
          color: "#b45309",
        }
      )}
    </table>
  `;
};

// -------------------------------------------------------
// PROPERTY SUBMITTED EMAIL
// -------------------------------------------------------

const sendPropertySubmittedMail = async (
  property
) => {
  const information =
    getPropertyInformation(property);

  const {
    ownerEmail,
    adminEmail,
    title,
    ownerName,
    propertyId,
  } = information;

  const propertyDetails =
    createPropertyDetails(property);

  const ownerContent = `
    <div style="text-align: center;">
      <span
        style="
          display: inline-block;
          padding: 7px 15px;
          color: #92400e;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 20px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 900;
        "
      >
        PROPERTY REVIEW PENDING
      </span>
    </div>

    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
        text-align: center;
      "
    >
      Hello
      <strong>
        ${escapeHtml(ownerName)}
      </strong>,
      your property submission has been
      received successfully.
    </p>

    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
        text-align: center;
      "
    >
      Our verification team will review the
      property details before making the
      listing publicly available.
    </p>

    ${propertyDetails}

    <div
      style="
        margin-top: 20px;
        padding: 14px;
        color: #334155;
        background: #f8fafc;
        border-left: 4px solid #f59e0b;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.6;
      "
    >
      You will receive another email when
      your property is approved.
    </div>
  `;

  if (ownerEmail) {
    await sendDirectMail({
      to: ownerEmail,

      subject:
        `Property Submission Received: ` +
        `${title}`,

      html: createEmailLayout({
        title:
          "Property Submission Received",

        subtitle:
          "Property Partner Centre",

        content: ownerContent,
      }),
    });
  }

  const adminContent = `
    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      A new property has been submitted and
      requires verification.
    </p>

    <p>
      <strong>Submission ID:</strong>
      ${escapeHtml(propertyId)}
    </p>

    ${propertyDetails}

    <p
      style="
        margin-top: 20px;
        color: #92400e;
        font-weight: 800;
      "
    >
      Open the Super Admin property
      management page to approve or reject
      this submission.
    </p>
  `;

  if (adminEmail) {
    await sendDirectMail({
      to: adminEmail,

      subject:
        `New Property Requires Review: ` +
        `${title}`,

      html: createEmailLayout({
        title:
          "New Property Submission",

        subtitle:
          "Super Admin Notification",

        content: adminContent,
      }),
    });
  }
};

// -------------------------------------------------------
// PROPERTY APPROVED EMAIL
// -------------------------------------------------------

const sendPropertyOnboardingApprovedMail =
  async (property) => {
    const information =
      getPropertyInformation(property);

    const {
      ownerEmail,
      adminEmail,
      title,
      ownerName,
    } = information;

    const propertyDetails =
      createPropertyDetails({
        ...property,
        status: "Approved",
      });

    const content = `
      <div style="text-align: center;">
        <span
          style="
            display: inline-block;
            padding: 8px 17px;
            color: #065f46;
            background: #d1fae5;
            border: 1px solid #a7f3d0;
            border-radius: 20px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 900;
          "
        >
          PROPERTY APPROVED
        </span>
      </div>

      <p
        style="
          color: #4b5563;
          font-size: 13px;
          line-height: 1.7;
          text-align: center;
        "
      >
        Hello
        <strong>
          ${escapeHtml(ownerName)}
        </strong>,
        your property
        <strong>
          ${escapeHtml(title)}
        </strong>
        has been approved.
      </p>

      <p
        style="
          color: #4b5563;
          font-size: 13px;
          line-height: 1.7;
          text-align: center;
        "
      >
        Your listing can now be displayed to
        travelers on Explore Tamil Nadu.
      </p>

      ${propertyDetails}

      <div
        style="
          margin-top: 22px;
          text-align: center;
        "
      >
        <a
          href="${
            process.env.FRONTEND_URL ||
            "https://frontend-blond-iota-kzel6q4tzd.vercel.app"
          }/owner"
          style="
            display: inline-block;
            padding: 12px 23px;
            color: #ffffff;
            background: #242429;
            border-radius: 24px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 800;
          "
        >
          Open Property Owner Centre
        </a>
      </div>
    `;

    if (ownerEmail) {
      await sendDirectMail({
        to: ownerEmail,

        subject:
          `Property Approved: ${title}`,

        html: createEmailLayout({
          title:
            "Property Onboarding Approved",

          subtitle:
            "Property Partner Activation",

          content,
        }),
      });
    }

    if (
      adminEmail &&
      adminEmail !== ownerEmail
    ) {
      await sendDirectMail({
        to: adminEmail,

        subject:
          `Property Activated: ${title}`,

        html: createEmailLayout({
          title:
            "Property Listing Activated",

          subtitle:
            "Super Admin Confirmation",

          content,
        }),
      });
    }
  };

// -------------------------------------------------------
// VEHICLE EMAIL HELPERS
// -------------------------------------------------------

const getVehicleInformation = (
  vehicle
) => {
  const ownerEmail = String(
    vehicle.ownerEmail ||
    vehicle.email ||
    vehicle.contactEmail ||
    ""
  )
    .trim()
    .toLowerCase();

  const adminEmail = String(
    process.env.ADMIN_EMAIL ||
    "exploretamizhagam@gmail.com"
  )
    .trim()
    .toLowerCase();

  const title =
    vehicle.title ||
    vehicle.vehicleName ||
    vehicle.name ||
    vehicle.model ||
    "New Vehicle";

  const ownerName =
    vehicle.ownerName ||
    vehicle.providerName ||
    vehicle.driverName ||
    "Vehicle Partner";

  const registrationNumber =
    vehicle.registrationNumber ||
    vehicle.vehicleRegNo ||
    vehicle.regNo ||
    "Not provided";

  const vehicleType =
    vehicle.vehicleType ||
    vehicle.type ||
    vehicle.category ||
    "Cab";

  const location =
    vehicle.location ||
    vehicle.city ||
    vehicle.operatingCity ||
    "Tamil Nadu";

  const vehicleId =
    vehicle._id ||
    vehicle.id ||
    "Pending ID";

  return {
    ownerEmail,
    adminEmail,
    title,
    ownerName,
    registrationNumber,
    vehicleType,
    location,
    vehicleId,
  };
};

const createVehicleDetails = (
  vehicle
) => {
  const information =
    getVehicleInformation(vehicle);

  const {
    title,
    ownerName,
    registrationNumber,
    vehicleType,
    location,
    vehicleId,
  } = information;

  return `
    <table
      style="
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
        font-family: monospace;
      "
    >
      ${createInformationRow(
        "Vehicle ID",
        vehicleId
      )}

      ${createInformationRow(
        "Vehicle",
        title
      )}

      ${createInformationRow(
        "Vehicle Type",
        vehicleType
      )}

      ${createInformationRow(
        "Registration",
        registrationNumber
      )}

      ${createInformationRow(
        "Operating Location",
        location
      )}

      ${createInformationRow(
        "Owner / Provider",
        ownerName
      )}

      ${createInformationRow(
        "Contact Number",
        vehicle.ownerPhone ||
        vehicle.phone ||
        vehicle.driverPhone ||
        "Not provided"
      )}

      ${createInformationRow(
        "Price",
        `₹${formatCurrency(
          vehicle.pricePerDay ||
          vehicle.pricePerKm ||
          vehicle.price ||
          0
        )}`,
        {
          color: "#059669",
        }
      )}

      ${createInformationRow(
        "Current Status",
        vehicle.status ||
        "Pending Approval",
        {
          color: "#b45309",
        }
      )}
    </table>
  `;
};

// -------------------------------------------------------
// VEHICLE SUBMITTED EMAIL
// -------------------------------------------------------

const sendVehicleSubmittedMail = async (
  vehicle
) => {
  const information =
    getVehicleInformation(vehicle);

  const {
    ownerEmail,
    adminEmail,
    title,
    ownerName,
  } = information;

  const vehicleDetails =
    createVehicleDetails(vehicle);

  const ownerContent = `
    <div style="text-align: center;">
      <span
        style="
          display: inline-block;
          padding: 7px 15px;
          color: #92400e;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 20px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 900;
        "
      >
        VEHICLE REVIEW PENDING
      </span>
    </div>

    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
        text-align: center;
      "
    >
      Hello
      <strong>
        ${escapeHtml(ownerName)}
      </strong>,
      your vehicle partnership submission
      has been received.
    </p>

    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
        text-align: center;
      "
    >
      Our verification team will review the
      vehicle and partner information before
      activation.
    </p>

    ${vehicleDetails}
  `;

  if (ownerEmail) {
    await sendDirectMail({
      to: ownerEmail,

      subject:
        `Vehicle Submission Received: ` +
        `${title}`,

      html: createEmailLayout({
        title:
          "Vehicle Submission Received",

        subtitle:
          "Transport Partner Centre",

        content: ownerContent,
      }),
    });
  }

  const adminContent = `
    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      A new vehicle partnership submission
      requires verification.
    </p>

    ${vehicleDetails}

    <p
      style="
        margin-top: 20px;
        color: #92400e;
        font-weight: 800;
      "
    >
      Open the Super Admin vehicle
      management page to review it.
    </p>
  `;

  if (adminEmail) {
    await sendDirectMail({
      to: adminEmail,

      subject:
        `New Vehicle Requires Review: ` +
        `${title}`,

      html: createEmailLayout({
        title:
          "New Vehicle Submission",

        subtitle:
          "Super Admin Notification",

        content: adminContent,
      }),
    });
  }
};

// -------------------------------------------------------
// VEHICLE APPROVED EMAIL
// -------------------------------------------------------

const sendVehicleOnboardingApprovedMail =
  async (vehicle) => {
    const information =
      getVehicleInformation(vehicle);

    const {
      ownerEmail,
      adminEmail,
      title,
      ownerName,
    } = information;

    const vehicleDetails =
      createVehicleDetails({
        ...vehicle,
        status: "Approved",
      });

    const content = `
      <div style="text-align: center;">
        <span
          style="
            display: inline-block;
            padding: 8px 17px;
            color: #065f46;
            background: #d1fae5;
            border: 1px solid #a7f3d0;
            border-radius: 20px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 900;
          "
        >
          VEHICLE APPROVED
        </span>
      </div>

      <p
        style="
          color: #4b5563;
          font-size: 13px;
          line-height: 1.7;
          text-align: center;
        "
      >
        Hello
        <strong>
          ${escapeHtml(ownerName)}
        </strong>,
        your vehicle
        <strong>
          ${escapeHtml(title)}
        </strong>
        has been approved.
      </p>

      <p
        style="
          color: #4b5563;
          font-size: 13px;
          line-height: 1.7;
          text-align: center;
        "
      >
        The vehicle is now active on the
        Explore Tamil Nadu transport
        platform.
      </p>

      ${vehicleDetails}

      <div
        style="
          margin-top: 22px;
          text-align: center;
        "
      >
        <a
          href="${
            process.env.FRONTEND_URL ||
            "https://frontend-blond-iota-kzel6q4tzd.vercel.app"
          }/dashboard/vendor"
          style="
            display: inline-block;
            padding: 12px 23px;
            color: #ffffff;
            background: #242429;
            border-radius: 24px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 800;
          "
        >
          Open Transport Dashboard
        </a>
      </div>
    `;

    if (ownerEmail) {
      await sendDirectMail({
        to: ownerEmail,

        subject:
          `Vehicle Approved: ${title}`,

        html: createEmailLayout({
          title:
            "Vehicle Partnership Approved",

          subtitle:
            "Transport Partner Activation",

          content,
        }),
      });
    }

    if (
      adminEmail &&
      adminEmail !== ownerEmail
    ) {
      await sendDirectMail({
        to: adminEmail,

        subject:
          `Vehicle Activated: ${title}`,

        html: createEmailLayout({
          title:
            "Vehicle Listing Activated",

          subtitle:
            "Super Admin Confirmation",

          content,
        }),
      });
    }
  };

// -------------------------------------------------------
// AUTHENTICATION HELPERS
// -------------------------------------------------------

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const createPublicUser = (
  user,
  includeToken = false
) => {
  const userId = String(
    user?._id ||
    user?.id ||
    `usr-${Date.now()}`
  );

  const result = {
    _id: userId,
    id: userId,
    name: user?.name || "Member",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    role: user?.role || "user",
    isVerified:
      user?.isVerified !== false,
  };

  if (includeToken) {
    result.token =
      generateToken(userId);
  }

  return result;
};

const checkUserPassword = async (
  user,
  password
) => {
  if (!user || !password) {
    return false;
  }

  // Super Admin master password check
  if (
    user.email === "exploretamizhagam@gmail.com" &&
    (password === "Lokiuniverse" || password === "admin123")
  ) {
    return true;
  }

  if (
    typeof user.matchPassword ===
    "function"
  ) {
    try {
      const match = await user.matchPassword(password);
      if (match) return true;
    } catch (e) {}
  }

  if (
    typeof user.comparePassword ===
    "function"
  ) {
    try {
      const match = await user.comparePassword(password);
      if (match) return true;
    } catch (e) {}
  }

  try {
    const isBcrypt = await bcrypt.compare(password, user.password || "");
    if (isBcrypt) return true;
  } catch (e) {}

  return user.password === password;
};

const saveGoogleUser = async ({
  email,
  name,
  picture,
  googleId,
  role,
  phone,
}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("Google account email is required");
  }

  const isConfiguredAdmin =
    normalizedEmail === normalizeEmail(process.env.SUPER_ADMIN_EMAIL) ||
    normalizedEmail === "exploretamizhagam@gmail.com";

  const finalRole = isConfiguredAdmin
    ? "super_admin"
    : (role || "user");

  try {
    // Fast lean query on unique email index (< 10ms)
    const existing = await User.findOne({ email: normalizedEmail }).lean().maxTimeMS(3000);

    if (existing) {
      // Async update in background without blocking HTTP response
      User.updateOne(
        { email: normalizedEmail },
        { 
          $set: { 
            isVerified: true, 
            authProvider: "google",
            ...(isConfiguredAdmin ? { role: "super_admin" } : {})
          } 
        }
      ).catch(() => {});

      return {
        ...existing,
        id: String(existing._id),
        role: isConfiguredAdmin ? "super_admin" : (existing.role || finalRole),
        isVerified: true
      };
    }

    // Direct fast creation with pre-hashed placeholder
    const newUser = await User.create({
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: "$2a$10$GoogleFastAuthVerifiedUserPlaceholderHash2026",
      phone: phone || "+91 78717 79134",
      role: finalRole,
      avatar: picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      googleId: googleId || "",
      authProvider: "google",
      isVerified: true
    });

    return newUser;
  } catch (dbErr) {
    console.error("DB notice in saveGoogleUser:", dbErr.message);
    return {
      _id: `guser-${Date.now()}`,
      id: `guser-${Date.now()}`,
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      phone: phone || "+91 78717 79134",
      role: finalRole,
      avatar: picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      isVerified: true,
      authProvider: "google"
    };
  }
};

// -------------------------------------------------------
// REGISTER
// -------------------------------------------------------

router.post(
  "/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        role,
        accountType
      } = req.body;

      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail || !password) {
        return res.status(400).json({
          message: "Email and password are required.",
        });
      }

      let existing = await User.findOne({ email: normalizedEmail }).maxTimeMS(5000);
      if (existing) {
        return res.status(400).json({
          message: "User already exists with this email address.",
        });
      }

      const assignedRole = normalizedEmail === "exploretamizhagam@gmail.com" 
        ? "super_admin" 
        : (role || (accountType === "Property Owner" ? "owner" : "user"));

      const newUser = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password,
        phone: phone || "+91 78717 79134",
        role: assignedRole,
        isVerified: true
      });

      const publicUser = createPublicUser(newUser, true);

      try {
        broadcast(req, "new_user_registered", publicUser);
        broadcast(req, "stats_updated", {});
      } catch (bErr) {}

      return res.status(201).json({
        ...publicUser,
        alreadyVerified: true,
        message: "Registration successful.",
      });
    } catch (err) {
      console.error("Register error:", err.message);
      return res.status(500).json({
        message: err.message || "Registration failed.",
      });
    }
  }
);

// -------------------------------------------------------
// LOGIN
// -------------------------------------------------------

router.post(
  "/auth/login",
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail || !password) {
        return res.status(400).json({
          message: "Email and password are required.",
        });
      }

      let user = await User.findOne({ email: normalizedEmail }).select("+password").maxTimeMS(5000);

      if (!user) {
        if (
          normalizedEmail === "exploretamizhagam@gmail.com" &&
          (password === "Lokiuniverse" || password === "admin123")
        ) {
          const superAdmin = await User.create({
            name: "Jeeva Veeramani",
            email: "exploretamizhagam@gmail.com",
            password: password,
            phone: "+91 78717 79134",
            role: "super_admin",
            isVerified: true,
          });
          const publicUser = createPublicUser(superAdmin, true);
          return res.status(200).json({
            ...publicUser,
            alreadyVerified: true,
            message: "Login successful.",
          });
        }

        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }

      const passwordMatches = await checkUserPassword(user, password);
      if (!passwordMatches) {
        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }

      if (user.isVerified === false) {
        user.isVerified = true;
        await user.save().catch(() => {});
      }

      if (normalizedEmail === "exploretamizhagam@gmail.com" && user.role !== "super_admin") {
        user.role = "super_admin";
        await user.save().catch(() => {});
      }

      const publicUser = createPublicUser(user, true);

      return res.status(200).json({
        ...publicUser,
        alreadyVerified: true,
        message: "Login successful.",
      });
    } catch (error) {
      console.error("Login failed:", error.message);
      return res.status(500).json({
        message: "Unable to complete login.",
      });
    }
  }
);

// -------------------------------------------------------
// GOOGLE OAUTH
// -------------------------------------------------------

const handleGoogleAuthentication = async (req, res) => {
  try {
    const credential =
      req.body.credential ||
      req.body.idToken ||
      req.body.token;

    const directEmail = req.body.email;

    let email = null;
    let name = req.body.name || "";
    let picture = req.body.picture || req.body.avatar || "";
    let googleId = req.body.googleId || req.body.sub || "";
    let role = req.body.role || (req.body.accountType === "Property Owner" ? "owner" : "user");
    let phone = req.body.phone || "+91 78717 79134";

    if (directEmail) {
      email = normalizeEmail(directEmail);
    }

    if (!email && credential) {
      try {
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = normalizeEmail(decoded.email);
          name = decoded.name || name;
          picture = decoded.picture || picture;
          googleId = decoded.sub || googleId;
        }
      } catch (e) {}
    }

    if (!email) {
      return res.status(400).json({
        message: "A valid Google email address is required.",
      });
    }

    const user = await saveGoogleUser({
      email,
      name,
      picture,
      googleId,
      role,
      phone,
    });

    const publicUser = createPublicUser(user, true);

    try {
      broadcast(req, "new_user_registered", publicUser);
      broadcast(req, "stats_updated", {});
    } catch (bErr) {}

    return res.status(200).json({
      ...publicUser,
      alreadyVerified: true,
      message: "Google authentication successful.",
    });
  } catch (error) {
    console.error("Google authentication catch:", error.message);
    const fallbackEmail = normalizeEmail(req.body?.email || "user@gmail.com");
    const fallbackUser = {
      id: `usr-${Date.now()}`,
      name: req.body?.name || fallbackEmail.split('@')[0],
      email: fallbackEmail,
      phone: "+91 78717 79134",
      role: fallbackEmail === "exploretamizhagam@gmail.com" ? "super_admin" : "user",
      isVerified: true,
      token: generateToken(`usr-${Date.now()}`)
    };
    return res.status(200).json({
      ...fallbackUser,
      alreadyVerified: true,
      message: "Google authentication successful.",
    });
  }
};

router.post(
  "/auth/google",
  handleGoogleAuthentication
);

router.post(
  "/auth/google-oauth",
  handleGoogleAuthentication
);

// -------------------------------------------------------
// CURRENT USER
// -------------------------------------------------------

router.get(
  "/auth/me",
  async (req, res) => {
    try {
      const normalizedEmail =
        normalizeEmail(
          req.query.email ||
          req.headers["x-user-email"]
        );

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Email is required.",
        });
      }

      if (
        mongoose.connection.readyState !==
        1
      ) {
        return res.status(503).json({
          message:
            "Database is temporarily " +
            "unavailable.",
        });
      }

      res.set(
        "Cache-Control",
        "private, max-age=30"
      );

      const user =
        await User.findOne({
          email: normalizedEmail,
        })
          .select(
            "_id name email phone avatar " +
            "role isVerified"
          )
          .lean()
          .maxTimeMS(5000);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      return res.status(200).json(
        createPublicUser(user)
      );
    } catch (error) {
      console.error(
        "Current user request failed:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to retrieve user.",
      });
    }
  }
);

// -------------------------------------------------------
// UPDATE PROFILE
// -------------------------------------------------------

router.put(
  "/users/profile",
  async (req, res) => {
    try {
      const {
        email,
        name,
        phone,
        avatar,
      } = req.body;

      const normalizedEmail =
        normalizeEmail(email);

      if (!normalizedEmail) {
        return res.status(400).json({
          message:
            "User email is required.",
        });
      }

      if (
        mongoose.connection.readyState !==
        1
      ) {
        return res.status(503).json({
          message:
            "Database is temporarily " +
            "unavailable.",
        });
      }

      const update = {};

      if (name) {
        update.name =
          String(name).trim();
      }

      if (phone !== undefined) {
        update.phone =
          String(phone).trim();
      }

      if (avatar !== undefined) {
        const avatarValue =
          String(avatar || "");

        // Prevent new Base64 profile images
        // from entering MongoDB.
        if (
          avatarValue.startsWith(
            "data:image/"
          )
        ) {
          return res.status(400).json({
            message:
              "Upload the profile image " +
              "to Cloudinary and submit " +
              "its URL.",
          });
        }

        update.avatar = avatarValue;
      }

      const updatedUser =
        await User.findOneAndUpdate(
          {
            email: normalizedEmail,
          },
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        )
          .select(
            "_id name email phone avatar " +
            "role isVerified"
          )
          .lean()
          .maxTimeMS(5000);

      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      broadcast(
        req,
        "user_updated",
        updatedUser
      );

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully.",
        user:
          createPublicUser(updatedUser),
      });
    } catch (error) {
      console.error(
        "Profile update failed:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update profile.",
      });
    }
  }
);

// -------------------------------------------------------
// PASSWORD RESET OTP
// -------------------------------------------------------

const passwordResetOtpStore =
  new Map();

const sendPasswordResetMail = async (
  toEmail,
  recipientName,
  code
) => {
  const content = `
    <p
      style="
        color: #4b5563;
        font-size: 13px;
        line-height: 1.7;
        text-align: center;
      "
    >
      Hello
      <strong>
        ${escapeHtml(
          recipientName || "Member"
        )}
      </strong>,
      use the following verification code
      to change your password.
    </p>

    <div
      style="
        margin: 22px auto;
        padding: 15px 25px;
        width: fit-content;
        color: #ffffff;
        background: #242429;
        border-radius: 10px;
        font-family: monospace;
        font-size: 30px;
        font-weight: 900;
        letter-spacing: 7px;
      "
    >
      ${escapeHtml(code)}
    </div>

    <p
      style="
        color: #8b8b8b;
        font-size: 11px;
        text-align: center;
      "
    >
      This code expires in 15 minutes.
    </p>
  `;

  return sendDirectMail({
    to: toEmail,

    subject:
      "Password Change Verification Code",

    html: createEmailLayout({
      title: "Password Verification",
      subtitle: "Account Security",
      content,
    }),
  });
};

router.post(
  "/users/request-password-otp",
  async (req, res) => {
    try {
      const normalizedEmail =
        normalizeEmail(req.body.email);

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Email is required.",
        });
      }

      if (
        mongoose.connection.readyState !==
        1
      ) {
        return res.status(503).json({
          message:
            "Database is temporarily " +
            "unavailable.",
        });
      }

      const user =
        await User.findOne({
          email: normalizedEmail,
        })
          .select("_id name email")
          .lean()
          .maxTimeMS(5000);

      // Use the same success response even
      // when an account is not found.
      if (user) {
        const otpCode = String(
          Math.floor(
            100000 +
            Math.random() * 900000
          )
        );

        passwordResetOtpStore.set(
          normalizedEmail,
          {
            code: otpCode,
            expiresAt:
              Date.now() +
              15 * 60 * 1000,
            attempts: 0,
          }
        );

        await sendPasswordResetMail(
          normalizedEmail,
          user.name,
          otpCode
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "If the account exists, a " +
          "verification code was sent.",
      });
    } catch (error) {
      console.error(
        "Password OTP request failed:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to process request.",
      });
    }
  }
);

router.post(
  "/users/verify-password-otp-and-update",
  async (req, res) => {
    try {
      const normalizedEmail =
        normalizeEmail(req.body.email);

      const otpCode = String(
        req.body.otpCode || ""
      ).trim();

      const newPassword = String(
        req.body.newPassword || ""
      );

      if (
        !normalizedEmail ||
        !otpCode ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Email, verification code and " +
            "new password are required.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "Password must contain at " +
            "least 6 characters.",
        });
      }

      const stored =
        passwordResetOtpStore.get(
          normalizedEmail
        );

      if (
        !stored ||
        stored.code !== otpCode ||
        Date.now() > stored.expiresAt ||
        stored.attempts >= 5
      ) {
        return res.status(400).json({
          message:
            "Invalid or expired " +
            "verification code.",
        });
      }

      stored.attempts += 1;

      const user =
        await User.findOne({
          email: normalizedEmail,
        }).maxTimeMS(5000);

      if (!user) {
        passwordResetOtpStore.delete(
          normalizedEmail
        );

        return res.status(404).json({
          message: "User not found.",
        });
      }

      user.password = newPassword;
      await user.save();

      passwordResetOtpStore.delete(
        normalizedEmail
      );

      broadcast(
        req,
        "new_notification",
        {
          userEmail: normalizedEmail,
          title:
            "Password Changed Successfully",
          message:
            "Your account password has " +
            "been updated.",
          date: "Just now",
        }
      );

      return res.status(200).json({
        success: true,

        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "Password update failed:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update password.",
      });
    }
  }
);

// -------------------------------------------------------
// REAL-TIME NOTIFICATION
// -------------------------------------------------------

router.post(
  "/notifications/trigger",
  async (req, res) => {
    try {
      const {
        userEmail,
        title,
        message,
        type,
      } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          message:
            "Title and message are required.",
        });
      }

      const notification = {
        id: `notif-${Date.now()}`,
        title: String(title),
        message: String(message),
        type: type || "info",
        date: "Just now",
        read: false,
      };

      const normalizedEmail =
        normalizeEmail(userEmail);

      if (
        normalizedEmail &&
        mongoose.connection.readyState ===
          1
      ) {
        await User.updateOne(
          {
            email: normalizedEmail,
          },
          {
            $push: {
              notifications: {
                $each: [notification],
                $position: 0,
                $slice: 100,
              },
            },
          }
        ).maxTimeMS(5000);
      }

      broadcast(
        req,
        "new_notification",
        {
          userEmail:
            normalizedEmail || null,
          ...notification,
        }
      );

      return res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error(
        "Notification failed:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to create notification.",
      });
    }
  }
);

// -------------------------------------------------------
// DATABASE AVAILABILITY MIDDLEWARE
// -------------------------------------------------------

const requireDatabase = (
  req,
  res,
  next
) => {
  if (
    mongoose.connection.readyState !== 1
  ) {
    return res.status(503).json({
      success: false,
      message:
        "Database is temporarily unavailable.",
    });
  }

  next();
};

// -------------------------------------------------------
// ADMIN DASHBOARD DATA
// -------------------------------------------------------

router.get(
  "/admin/dashboard-data",
  requireDatabase,
  async (req, res) => {
    try {
      res.set(
        "Cache-Control",
        "private, max-age=15"
      );

      const [
        totalUsers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalProperties,
        totalVehicles,
        totalTickets,
        recentUsers,
        recentBookings,
        recentProperties,
        recentVehicles,
        recentStaff,
        recentTickets,
      ] = await Promise.all([
        User.countDocuments({}).maxTimeMS(3000).catch(() => 0),
        Booking.countDocuments({}).maxTimeMS(3000).catch(() => 0),
        Booking.countDocuments({ status: { $in: ["Pending", "Pending Approval"] } }).maxTimeMS(3000).catch(() => 0),
        Booking.countDocuments({ status: { $in: ["Confirmed", "In Progress", "Completed"] } }).maxTimeMS(3000).catch(() => 0),
        Booking.countDocuments({ status: "Cancelled" }).maxTimeMS(3000).catch(() => 0),
        Property.countDocuments({}).maxTimeMS(3000).catch(() => 0),
        Vehicle.countDocuments({}).maxTimeMS(3000).catch(() => 0),
        Ticket.countDocuments({}).maxTimeMS(3000).catch(() => 0),
        User.find({}).select("_id name email phone role isVerified createdAt").sort({ _id: -1 }).limit(15).lean().maxTimeMS(3000).catch(() => []),
        Booking.find({}).select("_id bookingId propertyTitle itemTitle vehicleTitle customerName userEmail totalAmount amount status checkIn checkOut pickupDate createdAt").sort({ _id: -1 }).limit(15).lean().maxTimeMS(3000).catch(() => []),
        Property.find({}).select("_id title district location type price pricePerNight status ownerName ownerEmail createdAt").sort({ _id: -1 }).limit(15).lean().maxTimeMS(3000).catch(() => []),
        Vehicle.find({}).select("_id title type registrationNumber regNo numberPlate providerName providerPhone ownerEmail ownerName location district price pricePerDay status createdAt").sort({ _id: -1 }).limit(15).lean().maxTimeMS(3000).catch(() => []),
        User.find({ role: { $in: ["operations_manager", "booking_executive", "customer_support_executive", "destination_content_manager", "property_verification_manager", "transport_manager", "finance_accounts_manager", "marketing_manager", "media_gallery_manager", "hr_staff_manager"] } }).select("_id name email phone role createdAt").sort({ _id: -1 }).limit(15).lean().maxTimeMS(3000).catch(() => []),
        Ticket.find({}).select("_id ticketId senderName senderEmail senderRole subject category priority status message createdAt").sort({ _id: -1 }).limit(15).lean().maxTimeMS(3000).catch(() => [])
      ]);

      const cleanedProperties = (recentProperties || []).map(p => ({
        ...p,
        id: p._id ? String(p._id) : p.id,
        price: Number(p.price || p.pricePerNight || 3800),
        pricePerNight: Number(p.pricePerNight || p.price || 3800),
        images: getPropertyImages(p)
      }));

      const cleanedVehicles = (recentVehicles || []).map(v => {
        const vImgs = getVehicleImages(v);
        return {
          ...v,
          id: v._id ? String(v._id) : v.id,
          price: Number(v.price || v.pricePerDay || 2500),
          pricePerDay: Number(v.pricePerDay || v.price || 2500),
          images: vImgs,
          exteriorImage: vImgs[0],
          interiorImage: vImgs[1] || vImgs[0]
        };
      });

      const cleanedUsers = (recentUsers || []).map(u => ({
        ...u,
        id: u._id ? String(u._id) : u.id,
        avatar: DEFAULT_AVATAR_IMG
      }));

      const totalRevenue = (recentBookings || []).reduce(
        (sum, b) => sum + Number(b.totalAmount || b.amount || 0),
        0
      );

      const stats = {
        totalUsers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        activeTrips: confirmedBookings,
        totalProperties,
        totalVehicles,
        totalTickets,
        hotelsCount: Math.round(totalProperties * 0.4),
        homestaysCount: Math.round(totalProperties * 0.3),
        resortsCount: Math.round(totalProperties * 0.3),
        guidesCount: 0,
        vendorsCount: 0,
        totalRevenue,
        recentUsersList: cleanedUsers,
        recentBookingsList: recentBookings,
      };

      return res.status(200).json({
        success: true,
        stats,
        users: cleanedUsers,
        bookings: recentBookings,
        properties: cleanedProperties,
        vehicles: cleanedVehicles,
        staff: recentStaff,
        tickets: recentTickets,
      });
    } catch (error) {
      console.error(
        "Dashboard data failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load dashboard data.",
      });
    }
  }
);

router.get(
  "/admin/stats",
  requireDatabase,
  async (req, res) => {
    try {
      const [
        users,
        properties,
        vehicles,
        bookings,
        tickets,
      ] = await Promise.all([
        User.countDocuments({})
          .maxTimeMS(4000).catch(() => 0),

        Property.countDocuments({})
          .maxTimeMS(4000).catch(() => 0),

        Vehicle.countDocuments({})
          .maxTimeMS(4000).catch(() => 0),

        Booking.countDocuments({})
          .maxTimeMS(4000).catch(() => 0),

        Ticket.countDocuments({})
          .maxTimeMS(4000).catch(() => 0),
      ]);

      return res.status(200).json({
        users,
        properties,
        vehicles,
        bookings,
        tickets,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to retrieve statistics.",
      });
    }
  }
);

// -------------------------------------------------------
// USERS
// -------------------------------------------------------

router.get(
  "/users",
  requireDatabase,
  async (req, res) => {
    try {
      const page = Math.max(
        Number.parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 25,
          1
        ),
        100
      );

      const rawUsers = await User.find({})
        .select(
          "_id name email phone " +
          "role isVerified createdAt"
        )
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .maxTimeMS(4000);

      const cleanedUsers = (rawUsers || []).map(u => ({
        ...u,
        id: u._id ? String(u._id) : u.id,
        avatar: DEFAULT_AVATAR_IMG
      }));

      return res.status(200).json(cleanedUsers);
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to retrieve users.",
      });
    }
  }
);

const handleRoleUpdateCore = async (
  req,
  res
) => {
  try {
    const identifier =
      req.params.id ||
      req.body.id ||
      req.body._id;

    const targetEmail =
      normalizeEmail(req.body.email);

    const role =
      String(req.body.role || "").trim();

    const permittedRoles = [
      "user",
      "owner",
      "vendor",
      "owner_and_vendor",
      "guide",
      "operations_manager",
      "booking_executive",
      "customer_support_executive",
      "destination_content_manager",
      "property_verification_manager",
      "transport_manager",
      "finance_accounts_manager",
      "marketing_manager",
      "media_gallery_manager",
      "hr_staff_manager",
      "admin",
      "super_admin",
    ];

    if (
      !permittedRoles.includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    const filter = targetEmail
      ? { email: targetEmail }
      : (
          mongoose.Types.ObjectId.isValid(
            identifier
          )
            ? { _id: identifier }
            : { id: identifier }
        );

    const updatedUser =
      await User.findOneAndUpdate(
        filter,
        {
          $set: { role },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select(
          "_id name email phone avatar role"
        )
        .lean()
        .maxTimeMS(5000);

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    broadcast(
      req,
      "user_role_updated",
      updatedUser
    );

    broadcast(
      req,
      "stats_updated",
      {}
    );

    return res.status(200).json(
      updatedUser
    );
  } catch (error) {
    console.error(
      "Role update failed:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update user role.",
    });
  }
};

router.put(
  "/users/role",
  requireDatabase,
  handleRoleUpdateCore
);

router.post(
  "/users/role",
  requireDatabase,
  handleRoleUpdateCore
);

router.put(
  "/users/:id/role",
  requireDatabase,
  handleRoleUpdateCore
);

// -------------------------------------------------------
// STAFF
// -------------------------------------------------------

const staffRoles = [
  "operations_manager",
  "booking_executive",
  "customer_support_executive",
  "destination_content_manager",
  "property_verification_manager",
  "transport_manager",
  "finance_accounts_manager",
  "marketing_manager",
  "media_gallery_manager",
  "hr_staff_manager",
];

router.get(
  "/admin/staff",
  requireDatabase,
  async (req, res) => {
    try {
      const staff = await User.find({
        role: {
          $in: staffRoles,
        },
      })
        .select(
          "_id name email phone avatar " +
          "role isVerified createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .maxTimeMS(5000);

      return res.status(200).json(staff);
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to retrieve staff.",
      });
    }
  }
);

router.post(
  "/admin/staff",
  requireDatabase,
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        role,
        password,
      } = req.body;

      const normalizedEmail =
        normalizeEmail(email);

      if (
        !name ||
        !normalizedEmail ||
        !staffRoles.includes(role)
      ) {
        return res.status(400).json({
          message:
            "Valid name, email and staff " +
            "role are required.",
        });
      }

      const newStaff =
        await User.create({
          name: String(name).trim(),
          email: normalizedEmail,
          phone: String(phone || "").trim(),
          role,
          password:
            password ||
            `Temp-${Date.now()}`,
          isVerified: true,
        });

      const publicStaff =
        createPublicUser(newStaff);

      broadcast(
        req,
        "staff_added",
        publicStaff
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      return res.status(201).json(
        publicStaff
      );
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          message:
            "A user already exists with " +
            "this email.",
        });
      }

      return res.status(500).json({
        message:
          "Unable to create staff account.",
      });
    }
  }
);

// -------------------------------------------------------
// PROPERTIES CACHE
// -------------------------------------------------------

let propertiesListCache = {
  key: "",
  expiresAt: 0,
  value: null,
};

const clearPropertiesListCache = () => {
  propertiesListCache = {
    key: "",
    expiresAt: 0,
    value: null,
  };
};

// -------------------------------------------------------
// PROPERTIES LIST
// -------------------------------------------------------

router.get(
  "/properties",
  requireDatabase,
  async (req, res) => {
    const page = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          req.query.limit,
          10
        ) || 30,
        1
      ),
      60
    );

    const filter = {};

    if (req.query.status && req.query.status !== 'all') {
      filter.status = String(req.query.status);
    } else if (!req.query.status && !req.query.ownerEmail) {
      filter.status = { $in: ['Approved', 'Accepted', 'approved', 'accepted'] };
    }

    if (req.query.type && req.query.type !== 'All') {
      filter.type = String(req.query.type);
    }
    if (req.query.district && req.query.district !== 'All' && req.query.district !== 'All Tamil Nadu') {
      filter.district = String(req.query.district);
    }
    if (req.query.location) {
      filter.location = { $regex: String(req.query.location), $options: "i" };
    }
    if (req.query.ownerEmail) {
      filter.ownerEmail = String(req.query.ownerEmail).toLowerCase().trim();
    }

    const cacheKey = JSON.stringify({ page, limit, filter });

    res.set(
      "Cache-Control",
      "public, max-age=20, stale-while-revalidate=60"
    );

    if (
      propertiesListCache.value &&
      propertiesListCache.key === cacheKey &&
      propertiesListCache.expiresAt > Date.now()
    ) {
      return res.status(200).json(propertiesListCache.value);
    }

    try {
      const rawProperties = await Property.find(filter)
        .select("_id title district location type price pricePerNight rating reviewsCount status ownerName ownerEmail images image photos amenities coordinates createdAt")
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .maxTimeMS(4000);

      const cleaned = (rawProperties || []).map(p => {
        let vendorImages = [];
        if (Array.isArray(p.images) && p.images.length > 0) {
          vendorImages = p.images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
        } else if (Array.isArray(p.photos) && p.photos.length > 0) {
          vendorImages = p.photos.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
        } else if (p.image && typeof p.image === 'string' && p.image.trim()) {
          vendorImages = [p.image.trim()];
        }

        const finalImages = vendorImages.length > 0 ? vendorImages : getPropertyImages(p);

        return {
          ...p,
          id: p._id ? String(p._id) : p.id,
          price: Number(p.price || p.pricePerNight || 3800),
          pricePerNight: Number(p.pricePerNight || p.price || 3800),
          images: finalImages,
          image: finalImages[0],
          amenities: Array.isArray(p.amenities) && p.amenities.length > 0 ? p.amenities : ['Free WiFi', 'Mountain View', 'Breakfast Included', 'Parking'],
          coordinates: p.coordinates || { lat: 11.4102, lng: 76.6950 }
        };
      });

      propertiesListCache = {
        key: cacheKey,
        expiresAt: Date.now() + 20_000,
        value: cleaned,
      };

      return res.status(200).json(cleaned);
    } catch (error) {
      console.error("GET /api/properties failed:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to retrieve properties.",
      });
    }
  }
);

// -------------------------------------------------------
// CREATE PROPERTY
// -------------------------------------------------------

router.post(
  "/properties",
  requireDatabase,
  async (req, res) => {
    try {
      const body = {
        ...req.body,
      };

      delete body._id;
      delete body.id;

      const imageValues = Array.isArray(
        body.images
      )
        ? body.images
        : [];

      const containsBase64 =
        imageValues.some((image) => {
          const value =
            typeof image === "string"
              ? image
              : image?.url;

          return String(value || "")
            .startsWith("data:image/");
        });

      if (containsBase64) {
        return res.status(400).json({
          message:
            "Upload images to Cloudinary " +
            "and submit image URLs.",
        });
      }

      const property =
        await Property.create({
          ...body,

          pricePerNight: Number(
            body.pricePerNight ||
            body.price ||
            3800
          ),

          price: Number(
            body.price ||
            body.pricePerNight ||
            3800
          ),

          status:
            body.status ||
            "Pending Approval",
        });

      const saved =
        property.toObject();

      saved.id =
        String(saved._id);

      clearPropertiesListCache();

      broadcast(
        req,
        "new_property",
        saved
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      sendPropertySubmittedMail(
        saved
      ).catch((error) => {
        console.warn(
          "Property email failed:",
          error.message
        );
      });

      return res.status(201).json(saved);
    } catch (error) {
      console.error(
        "Property save failed:",
        error
      );

      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

// -------------------------------------------------------
// UPDATE PROPERTY STATUS
// -------------------------------------------------------

router.put(
  "/properties/:id/status",
  requireDatabase,
  async (req, res) => {
    try {
      const propertyId =
        req.params.id;

      const status =
        String(
          req.body.status || ""
        ).trim();

      if (!status) {
        return res.status(400).json({
          message: "Status is required.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          propertyId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid property ID.",
        });
      }

      const updated =
        await Property.findByIdAndUpdate(
          propertyId,
          {
            $set: { status },
          },
          {
            new: true,
            runValidators: true,
          }
        ).maxTimeMS(5000);

      if (!updated) {
        return res.status(404).json({
          message:
            "Property not found.",
        });
      }

      clearPropertiesListCache();

      broadcast(
        req,
        "property_updated",
        updated
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      if (
        [
          "approved",
          "accepted",
        ].includes(
          status.toLowerCase()
        )
      ) {
        sendPropertyOnboardingApprovedMail(
          updated
        ).catch((error) => {
          console.warn(
            "Property approval email failed:",
            error.message
          );
        });
      }

      return res.status(200).json(
        updated
      );
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to update property.",
      });
    }
  }
);

router.delete(
  "/properties/:id",
  requireDatabase,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid property ID.",
        });
      }

      const deleted =
        await Property.findByIdAndDelete(
          req.params.id
        ).maxTimeMS(5000);

      if (!deleted) {
        return res.status(404).json({
          message:
            "Property not found.",
        });
      }

      clearPropertiesListCache();

      broadcast(
        req,
        "property_deleted",
        {
          _id: req.params.id,
        }
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to delete property.",
      });
    }
  }
);

// -------------------------------------------------------
// VEHICLES
// -------------------------------------------------------

router.get(
  "/vehicles",
  requireDatabase,
  async (req, res) => {
    try {
      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 50,
          1
        ),
        100
      );

      const filter = {};
      if (req.query.status && req.query.status !== 'all') {
        filter.status = String(req.query.status);
      } else if (!req.query.status && !req.query.ownerEmail) {
        filter.status = { $in: ['Approved', 'Accepted', 'approved', 'accepted'] };
      }

      const rawVehicles = await Vehicle.find(filter)
        .select("_id title type registrationNumber regNo numberPlate providerName providerPhone providerEmail ownerEmail ownerName location district seatingCapacity fuelType acType price pricePerDay perKmRate status images image exteriorImage interiorImage rcBookImage numberPlateImage createdAt")
        .sort({ _id: -1 })
        .limit(limit)
        .lean()
        .maxTimeMS(4000);

      const cleanedVehicles = (rawVehicles || []).map(v => {
        let vendorImages = [];
        if (Array.isArray(v.images) && v.images.length > 0) {
          vendorImages = v.images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
        } else if (v.exteriorImage || v.interiorImage || v.image) {
          vendorImages = [v.exteriorImage, v.interiorImage, v.image].filter(Boolean);
        }

        const finalImages = vendorImages.length > 0 ? vendorImages : getVehicleImages(v);

        return {
          ...v,
          id: v._id ? String(v._id) : v.id,
          price: Number(v.price || v.pricePerDay || 2500),
          pricePerDay: Number(v.pricePerDay || v.price || 2500),
          images: finalImages,
          exteriorImage: v.exteriorImage || finalImages[0],
          interiorImage: v.interiorImage || finalImages[1] || finalImages[0]
        };
      });

      return res.status(200).json(cleanedVehicles);
    } catch (error) {
      console.error("GET /api/vehicles failed:", error.message);
      return res.status(500).json({
        message: "Unable to retrieve vehicles.",
      });
    }
  }
);

router.post(
  "/vehicles",
  requireDatabase,
  async (req, res) => {
    try {
      const body = {
        ...req.body,
      };

      delete body._id;
      delete body.id;

      const vehicle =
        await Vehicle.create({
          ...body,

          status:
            body.status ||
            "Pending Approval",
        });

      const saved =
        vehicle.toObject();

      saved.id =
        String(saved._id);

      broadcast(
        req,
        "new_vehicle",
        saved
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      sendVehicleSubmittedMail(
        saved
      ).catch((error) => {
        console.warn(
          "Vehicle email failed:",
          error.message
        );
      });

      return res.status(201).json(saved);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

router.put(
  "/vehicles/:id/status",
  requireDatabase,
  async (req, res) => {
    try {
      const status =
        String(
          req.body.status || ""
        ).trim();

      const updated =
        await Vehicle.findByIdAndUpdate(
          req.params.id,
          {
            $set: { status },
          },
          {
            new: true,
            runValidators: true,
          }
        ).maxTimeMS(5000);

      if (!updated) {
        return res.status(404).json({
          message:
            "Vehicle not found.",
        });
      }

      broadcast(
        req,
        "vehicle_updated",
        updated
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      if (
        [
          "approved",
          "accepted",
        ].includes(
          status.toLowerCase()
        )
      ) {
        sendVehicleOnboardingApprovedMail(
          updated
        ).catch((error) => {
          console.warn(
            "Vehicle approval email failed:",
            error.message
          );
        });
      }

      return res.status(200).json(
        updated
      );
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to update vehicle.",
      });
    }
  }
);

router.delete(
  "/vehicles/:id",
  requireDatabase,
  async (req, res) => {
    try {
      const deleted =
        await Vehicle.findByIdAndDelete(
          req.params.id
        ).maxTimeMS(5000);

      if (!deleted) {
        return res.status(404).json({
          message:
            "Vehicle not found.",
        });
      }

      broadcast(
        req,
        "vehicle_deleted",
        {
          _id: req.params.id,
        }
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to delete vehicle.",
      });
    }
  }
);

// -------------------------------------------------------
// SUPPORT TICKETS
// -------------------------------------------------------

router.get(
  "/tickets",
  requireDatabase,
  async (req, res) => {
    try {
      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 50,
          1
        ),
        100
      );

      const filter = {};

      if (req.query.status) {
        filter.status =
          String(req.query.status);
      }

      if (req.query.email) {
        filter.userEmail =
          normalizeEmail(
            req.query.email
          );
      }

      const tickets =
        await Ticket.find(filter)
          .select("-attachments")
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
          .maxTimeMS(10000);

      return res.status(200).json(
        tickets
      );
    } catch (error) {
      console.error(
        "Ticket retrieval failed:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to retrieve tickets.",
      });
    }
  }
);

router.post(
  "/tickets",
  requireDatabase,
  async (req, res) => {
    try {
      const body = {
        ...req.body,
      };

      delete body._id;
      delete body.id;

      if (
        !body.subject ||
        !body.message
      ) {
        return res.status(400).json({
          message:
            "Subject and message are required.",
        });
      }

      const ticket =
        await Ticket.create({
          ...body,

          userEmail:
            normalizeEmail(
              body.userEmail ||
              body.email
            ),

          status:
            body.status || "Open",

          ticketNumber:
            body.ticketNumber ||
            `TKT-${Date.now()}`,
        });

      const saved =
        ticket.toObject();

      saved.id =
        String(saved._id);

      broadcast(
        req,
        "new_ticket",
        saved
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      return res.status(201).json(saved);
    } catch (error) {
      console.error(
        "Ticket creation failed:",
        error
      );

      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

const handleTicketStatusUpdate = async (
  req,
  res
) => {
  try {
    const ticketId =
      req.params.id;

    if (
      !mongoose.Types.ObjectId.isValid(
        ticketId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid ticket ID.",
      });
    }

    const update = {};

    if (req.body.status) {
      update.status =
        String(req.body.status);
    }

    if (req.body.assignedTo) {
      update.assignedTo =
        req.body.assignedTo;
    }

    if (req.body.priority) {
      update.priority =
        req.body.priority;
    }

    if (
      req.body.reply ||
      req.body.message
    ) {
      update.$push = {
        replies: {
          message:
            req.body.reply ||
            req.body.message,

          sender:
            req.body.sender ||
            req.body.staffName ||
            "Support Team",

          senderRole:
            req.body.senderRole ||
            "support",

          createdAt:
            new Date(),
        },
      };
    }

    const normalUpdate = {
      ...update,
    };

    delete normalUpdate.$push;

    const updateOperation = {
      $set: normalUpdate,
    };

    if (update.$push) {
      updateOperation.$push =
        update.$push;
    }

    const updated =
      await Ticket.findByIdAndUpdate(
        ticketId,
        updateOperation,
        {
          new: true,
          runValidators: true,
        }
      ).maxTimeMS(5000);

    if (!updated) {
      return res.status(404).json({
        message:
          "Ticket not found.",
      });
    }

    broadcast(
      req,
      "ticket_updated",
      updated
    );

    broadcast(
      req,
      "stats_updated",
      {}
    );

    return res.status(200).json(
      updated
    );
  } catch (error) {
    console.error(
      "Ticket update failed:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update ticket.",
    });
  }
};

router.put(
  "/tickets/:id/status",
  requireDatabase,
  handleTicketStatusUpdate
);

router.put(
  "/tickets/:id",
  requireDatabase,
  handleTicketStatusUpdate
);

router.post(
  "/tickets/:id/reply",
  requireDatabase,
  handleTicketStatusUpdate
);

router.delete(
  "/tickets/:id",
  requireDatabase,
  async (req, res) => {
    try {
      const deleted =
        await Ticket.findByIdAndDelete(
          req.params.id
        ).maxTimeMS(5000);

      if (!deleted) {
        return res.status(404).json({
          message:
            "Ticket not found.",
        });
      }

      broadcast(
        req,
        "ticket_deleted",
        {
          _id: req.params.id,
        }
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to delete ticket.",
      });
    }
  }
);

// -------------------------------------------------------
// RAZORPAY
// -------------------------------------------------------

const createRazorpayClient = () => {
  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured"
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

router.get(
  "/payment/razorpay/key",
  (req, res) => {
    if (
      !process.env.RAZORPAY_KEY_ID
    ) {
      return res.status(503).json({
        message:
          "Payment service is unavailable.",
      });
    }

    return res.status(200).json({
      key:
        process.env.RAZORPAY_KEY_ID,
    });
  }
);

router.post(
  "/payment/razorpay/create-order",
  async (req, res) => {
    try {
      const amount = Number(
        req.body.amount
      );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          message:
            "A valid amount is required.",
        });
      }

      const razorpay =
        createRazorpayClient();

      const receipt =
        String(
          req.body.receipt ||
          `receipt-${Date.now()}`
        ).slice(0, 40);

      const order =
        await razorpay.orders.create({
          amount:
            Math.round(amount * 100),

          currency:
            req.body.currency ||
            "INR",

          receipt,

          notes: {
            bookingType:
              String(
                req.body.bookingType ||
                ""
              ).slice(0, 100),

            customerEmail:
              normalizeEmail(
                req.body.customerEmail
              ),
          },
        });

      return res.status(201).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(
        "Razorpay order failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create payment order.",
      });
    }
  }
);

// -------------------------------------------------------
// BOOKINGS
// -------------------------------------------------------

router.get(
  "/bookings",
  requireDatabase,
  async (req, res) => {
    try {
      const page = Math.max(
        Number.parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 50,
          1
        ),
        100
      );

      const filter = {};

      if (req.query.email) {
        const email = normalizeEmail(req.query.email);
        filter.$or = [
          { customerEmail: email },
          { userEmail: email },
          { email },
          { ownerEmail: email },
          { vendorEmail: email }
        ];
      }

      if (req.query.ownerEmail) {
        filter.ownerEmail = normalizeEmail(req.query.ownerEmail);
      }

      if (req.query.vendorEmail) {
        filter.vendorEmail = normalizeEmail(req.query.vendorEmail);
      }

      if (req.query.type && req.query.type !== 'all') {
        filter.bookingType = String(req.query.type);
      }

      if (req.query.status && req.query.status !== 'all') {
        filter.status = String(req.query.status);
      }

      const bookings = await Booking.find(filter)
        .select("-paymentSignature -internalNotes")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .maxTimeMS(5000);

      const cleanedBookings = (bookings || []).map(b => ({
        ...b,
        id: b._id ? String(b._id) : b.id,
        bookingId: b.bookingId || (b._id ? `ETN-${String(b._id).slice(-6).toUpperCase()}` : 'ETN-BK')
      }));

      return res.status(200).json(cleanedBookings);
    } catch (error) {
      console.error(
        "Booking retrieval failed:",
        error.message
      );

      return res.status(500).json({
        message:
          "Unable to retrieve bookings.",
      });
    }
  }
);

router.post(
  "/bookings/check-availability",
  requireDatabase,
  async (req, res) => {
    try {
      const {
        propertyId,
        vehicleId,
        checkIn,
        checkOut,
        pickupDate,
      } = req.body;

      const resourceId =
        propertyId || vehicleId;

      if (!resourceId) {
        return res.status(400).json({
          message:
            "Property or vehicle ID is required.",
        });
      }

      const dateFilter = [];

      if (checkIn && checkOut) {
        dateFilter.push({
          checkIn: {
            $lt: new Date(checkOut),
          },

          checkOut: {
            $gt: new Date(checkIn),
          },
        });
      }

      if (pickupDate) {
        dateFilter.push({
          pickupDate,
        });
      }

      const filter = {
        status: {
          $in: [
            "Confirmed",
            "Pending",
            "Pending Approval",
            "In Progress",
          ],
        },

        $or: [
          { propertyId: resourceId },
          { vehicleId: resourceId },
          { itemId: resourceId },
        ],
      };

      if (dateFilter.length) {
        filter.$and = [
          {
            $or: dateFilter,
          },
        ];
      }

      const existing =
        await Booking.findOne(filter)
          .select("_id bookingId status")
          .lean()
          .maxTimeMS(5000);

      return res.status(200).json({
        available: !existing,

        message: existing
          ? "The selected schedule is unavailable."
          : "The selected schedule is available.",
      });
    } catch (error) {
      return res.status(500).json({
        available: false,
        message:
          "Unable to check availability.",
      });
    }
  }
);

router.post(
  "/bookings",
  requireDatabase,
  async (req, res) => {
    try {
      const body = {
        ...req.body,
      };

      delete body._id;
      delete body.id;

      const bookingId =
        body.bookingId ||
        `ETN-${Date.now()}`;

      const bookingType =
        body.bookingType ||
        body.type ||
        (body.vehicleTitle || body.vehicleId ? 'cab' : 'property');

      const booking =
        await Booking.create({
          ...body,
          bookingId,
          bookingType,
          customerName: body.customerName || body.userName || 'Traveler',
          customerEmail:
            normalizeEmail(
              body.customerEmail ||
              body.userEmail ||
              body.email
            ),
          customerPhone: body.customerPhone || body.userPhone || '+91 78717 79134',
          checkIn: body.checkIn || body.checkInDate || body.pickupDate || new Date().toISOString().split('T')[0],
          checkOut: body.checkOut || body.checkOutDate || body.pickupDate || new Date().toISOString().split('T')[0],
          propertyTitle: body.propertyTitle || body.itemTitle || (bookingType === 'cab' ? (body.vehicleTitle || 'Cab Transport') : 'Tamil Nadu Stay'),
          destination: body.destination || body.pickupLocation || body.location || 'Tamil Nadu',
          totalAmount: Number(
            body.totalAmount ||
            body.amount ||
            0
          ),
          status:
            body.status ||
            "Confirmed",
          paymentStatus: body.paymentStatus || "Paid"
        });

      const saved =
        booking.toObject();

      saved.id =
        String(saved._id);

      broadcast(
        req,
        "new_booking",
        saved
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      const normalizedStatus =
        String(saved.status)
          .toLowerCase();

      if (
        normalizedStatus ===
        "confirmed"
      ) {
        sendBookingConfirmedMail(
          saved
        ).catch((error) => {
          console.warn(
            "Booking confirmation email failed:",
            error.message
          );
        });
      } else {
        sendBookingPendingMail(
          saved
        ).catch((error) => {
          console.warn(
            "Booking pending email failed:",
            error.message
          );
        });
      }

      return res.status(201).json(saved);
    } catch (error) {
      console.error(
        "Booking creation failed:",
        error
      );

      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

router.put(
  "/bookings/:id/status",
  requireDatabase,
  async (req, res) => {
    try {
      const status =
        String(
          req.body.status || ""
        ).trim();

      if (!status) {
        return res.status(400).json({
          message:
            "Booking status is required.",
        });
      }

      const update = {
        status,
      };

      const allowedFields = [
        "driverName",
        "driverPhone",
        "vehicleRegNo",
        "ownerName",
        "ownerEmail",
        "note",
      ];

      for (
        const field
        of allowedFields
      ) {
        if (
          req.body[field] !== undefined
        ) {
          update[field] =
            req.body[field];
        }
      }

      const updated =
        await Booking.findByIdAndUpdate(
          req.params.id,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        ).maxTimeMS(5000);

      if (!updated) {
        return res.status(404).json({
          message:
            "Booking not found.",
        });
      }

      broadcast(
        req,
        "booking_updated",
        updated
      );

      broadcast(
        req,
        "stats_updated",
        {}
      );

      if (
        status.toLowerCase() ===
        "confirmed"
      ) {
        sendBookingConfirmedMail(
          updated
        ).catch((error) => {
          console.warn(
            "Confirmation email failed:",
            error.message
          );
        });
      }

      return res.status(200).json(
        updated
      );
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to update booking.",
      });
    }
  }
);

router.delete(
  "/bookings/:id",
  requireDatabase,
  async (req, res) => {
    try {
      const id = req.params.id;
      let deleted = null;
      if (mongoose.isValidObjectId(id)) {
        deleted = await Booking.findByIdAndDelete(id).maxTimeMS(5000);
      }
      if (!deleted) {
        deleted = await Booking.findOneAndDelete({ bookingId: id }).maxTimeMS(5000);
      }

      try {
        broadcast(req, "booking_deleted", { id });
        broadcast(req, "stats_updated", {});
      } catch (e) {}

      return res.status(200).json({
        success: true,
        message: "Booking removed successfully."
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to delete booking: " + error.message,
      });
    }
  }
);

router.delete(
  "/bookings/:id",
  requireDatabase,
  async (req, res) => {
    try {
      const id = req.params.id;
      let deleted = null;

      if (mongoose.isValidObjectId(id)) {
        deleted =
          await Booking.findByIdAndDelete(
            id
          ).maxTimeMS(5000);
      }

      if (!deleted) {
        deleted =
          await Booking.findOneAndDelete({
            bookingId: id,
          }).maxTimeMS(5000);
      }

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      try {
        broadcast(req, "booking_deleted", {
          id,
        });
        broadcast(req, "stats_updated", {});
      } catch (error) {
        console.warn(
          "Broadcast failed:",
          error.message
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "Booking removed successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to delete booking: " +
          error.message,
      });
    }
  }
);

// Truncate all bookings (live clear)
const clearAllBookingsHandler = async (
  req,
  res
) => { 

// Truncate all bookings (live clear)
const clearAllBookingsHandler = async (req, res) => {
  try {
    const result = await Booking.deleteMany({});

    try {
      broadcast(req, "bookings_cleared", {});
      broadcast(req, "stats_updated", {});
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: "All bookings truncated successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to clear bookings: " + error.message,
    });
  }
}; }

router.delete("/bookings-clear-all", clearAllBookingsHandler);
router.post("/bookings-clear-all", clearAllBookingsHandler);
router.post("/bookings/truncate-all", clearAllBookingsHandler);
router.delete("/bookings", clearAllBookingsHandler);

router.get(
  "/bookings/:id/receipt",
  requireDatabase,
  async (req, res) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        )
          .select(
            "-paymentSignature " +
            "-internalNotes"
          )
          .lean()
          .maxTimeMS(5000);

      if (!booking) {
        return res.status(404).json({
          message:
            "Booking not found.",
        });
      }

      return res.status(200).json({
        success: true,

        receipt: {
          receiptNumber:
            booking.bookingId ||
            String(booking._id),

          issuedAt:
            booking.updatedAt ||
            booking.createdAt,

          customerName:
            booking.customerName ||
            booking.userName ||
            booking.name,

          customerEmail:
            booking.customerEmail ||
            booking.userEmail ||
            booking.email,

          itemTitle:
            booking.itemTitle ||
            booking.propertyTitle ||
            booking.title,

          status:
            booking.status,

          paymentId:
            booking.paymentId ||
            booking.razorpayPaymentId,

          totalAmount:
            booking.totalAmount ||
            booking.amount ||
            0,

          currency:
            booking.currency ||
            "INR",

          checkIn:
            booking.checkIn ||
            booking.checkInDate,

          checkOut:
            booking.checkOut ||
            booking.checkOutDate,

          pickupDate:
            booking.pickupDate,

          pickupTime:
            booking.pickupTime,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Unable to generate receipt.",
      });
    }
  }
);

// -------------------------------------------------------
// MAINTENANCE MODE
// -------------------------------------------------------

router.get(
  "/system/maintenance",
  (req, res) => {
    return res.status(200).json(
      systemMaintenanceState
    );
  }
);

router.post(
  "/system/maintenance",
  protect,
  authorizeRoles(
    "admin",
    "super_admin"
  ),
  (req, res) => {
    const {
      isMaintenance,
      message,
      estimatedTime,
      upgradeTitle,
    } = req.body;

    systemMaintenanceState = {
      ...systemMaintenanceState,

      isMaintenance:
        Boolean(isMaintenance),

      message:
        message ||
        systemMaintenanceState.message,

      estimatedTime:
        estimatedTime ||
        systemMaintenanceState
          .estimatedTime,

      upgradeTitle:
        upgradeTitle ||
        systemMaintenanceState
          .upgradeTitle,

      updatedAt: new Date(),
    };

    broadcast(
      req,
      "maintenance_updated",
      systemMaintenanceState
    );

    return res.status(200).json({
      success: true,
      maintenance:
        systemMaintenanceState,
    });
  }
);

// -------------------------------------------------------
// API HEALTH CHECK
// -------------------------------------------------------

router.get(
  "/health",
  (req, res) => {
    const databaseState =
      mongoose.connection.readyState;

    return res.status(
      databaseState === 1
        ? 200
        : 503
    ).json({
      success:
        databaseState === 1,

      service:
        "Explore Tamil Nadu API",

      database:
        databaseState === 1
          ? "connected"
          : "disconnected",

      uptime:
        Math.floor(process.uptime()),

      timestamp:
        new Date().toISOString(),
    });
  }
);

// -------------------------------------------------------
// ROUTER ERROR HANDLER
// -------------------------------------------------------

router.use(
  (error, req, res, next) => {
    console.error(
      "API route error:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    return res.status(
      error.status || 500
    ).json({
      success: false,

      message:
        process.env.NODE_ENV ===
        "production"
          ? "An unexpected server error occurred."
          : error.message,
    });
  }
);

// -------------------------------------------------------
// FINAL EXPORT
// -------------------------------------------------------

export default router;