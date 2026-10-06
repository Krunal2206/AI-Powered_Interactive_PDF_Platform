import { NextRequest, NextResponse } from "next/server";
import EmailTemplate from "@/components/ContactPage/EmailTemplate";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";

const resend = new Resend(serverEnv.RESEND_API_KEY);

// Rate limiter: 3 contact submissions per 15 minutes per IP
const contactLimiter = new Ratelimit({
  redis: new Redis({
    url: serverEnv.UPSTASH_REDIS_REST_URL,
    token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  prefix: "ratelimit:contact",
});

// Server-side validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254; // RFC 5321
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeInput(input: string): string {
  return input.trim().replace(/\0/g, "");
}

export async function POST(request: NextRequest) {
  try {
    // --- Rate Limiting (by IP) ---
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";

    const { success, reset } = await contactLimiter.limit(ip);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfterSeconds: retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        },
      );
    }

    // --- Parse & Validate Body ---
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { name, email, message } = body as Record<string, unknown>;

    // Type checks
    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json(
        { error: "Name, email, and message must be strings" },
        { status: 400 },
      );
    }

    // Sanitize
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = sanitizeInput(message);

    // Presence checks
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 },
      );
    }

    // Length checks
    if (sanitizedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${MAX_NAME_LENGTH} characters or less` },
        { status: 400 },
      );
    }

    if (sanitizedEmail.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { error: "Email address is too long" },
        { status: 400 },
      );
    }

    if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` },
        { status: 400 },
      );
    }

    // Email format validation
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    // --- Environment check ---
    const receiverEmail = serverEnv.CONTACT_RECEIVER_EMAIL;

    // --- Send Email ---
    const { data, error } = await resend.emails.send({
      from: "Chat with PDF <onboarding@resend.dev>",
      to: receiverEmail,
      subject: `New message from ${sanitizedName}`,
      react: EmailTemplate({
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
      }),
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Message sent successfully", id: data?.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
