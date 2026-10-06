interface EmailTemplateProps {
  name: string;
  email: string;
  message: string;
}

const EmailTemplate = ({ name, email, message }: EmailTemplateProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#f4f4f7",
        margin: 0,
        padding: "40px 0",
        width: "100%",
      }}
    >
      {/* Container */}
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <tbody>
          <tr>
            <td>
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #db2777)",
                  borderRadius: "12px 12px 0 0",
                  padding: "32px 40px",
                  textAlign: "center" as const,
                }}
              >
                <h1
                  style={{
                    color: "#ffffff",
                    fontSize: "24px",
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  📄 Chat with PDF
                </h1>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "14px",
                    margin: "8px 0 0",
                    fontWeight: 400,
                  }}
                >
                  New Contact Form Submission
                </p>
              </div>

              {/* Body */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "40px",
                  borderLeft: "1px solid #e5e7eb",
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                {/* Greeting */}
                <p
                  style={{
                    color: "#374151",
                    fontSize: "16px",
                    lineHeight: "24px",
                    margin: "0 0 24px",
                  }}
                >
                  You&apos;ve received a new message through the contact form.
                  Here are the details:
                </p>

                {/* Info Card */}
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "24px",
                    marginBottom: "24px",
                  }}
                >
                  {/* Name Row */}
                  <div
                    style={{
                      marginBottom: "16px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.5px",
                        margin: "0 0 4px",
                      }}
                    >
                      From
                    </p>
                    <p
                      style={{
                        color: "#111827",
                        fontSize: "16px",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {name}
                    </p>
                  </div>

                  {/* Email Row */}
                  <div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.5px",
                        margin: "0 0 4px",
                      }}
                    >
                      Email
                    </p>
                    <a
                      href={`mailto:${email}`}
                      style={{
                        color: "#7c3aed",
                        fontSize: "16px",
                        fontWeight: 500,
                        textDecoration: "none",
                      }}
                    >
                      {email}
                    </a>
                  </div>
                </div>

                {/* Message Section */}
                <div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.5px",
                      margin: "0 0 12px",
                    }}
                  >
                    Message
                  </p>
                  <div
                    style={{
                      backgroundColor: "#faf5ff",
                      border: "1px solid #e9d5ff",
                      borderLeft: "4px solid #7c3aed",
                      borderRadius: "0 8px 8px 0",
                      padding: "20px",
                    }}
                  >
                    <p
                      style={{
                        color: "#374151",
                        fontSize: "15px",
                        lineHeight: "26px",
                        margin: 0,
                        whiteSpace: "pre-wrap" as const,
                        wordBreak: "break-word" as const,
                      }}
                    >
                      {message}
                    </p>
                  </div>
                </div>

                {/* Reply CTA */}
                <div style={{ textAlign: "center" as const, marginTop: "32px" }}>
                  <a
                    href={`mailto:${email}?subject=Re: Your message on Chat with PDF`}
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #7c3aed, #db2777)",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: "none",
                      padding: "12px 32px",
                      borderRadius: "8px",
                    }}
                  >
                    Reply to {name}
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0 0 12px 12px",
                  border: "1px solid #e5e7eb",
                  borderTop: "none",
                  padding: "24px 40px",
                  textAlign: "center" as const,
                }}
              >
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "13px",
                    lineHeight: "20px",
                    margin: 0,
                  }}
                >
                  This email was sent from the contact form on{" "}
                  <span style={{ fontWeight: 600, color: "#6b7280" }}>
                    Chat with PDF
                  </span>
                </p>
                <p
                  style={{
                    color: "#d1d5db",
                    fontSize: "12px",
                    margin: "8px 0 0",
                  }}
                >
                  © {currentYear} Chat with PDF. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EmailTemplate;
