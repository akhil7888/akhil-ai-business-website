"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Enquiry = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  service: string;
  requirement: string;
  status: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin");
      return;
    }

    fetchEnquiries();
  }

  async function fetchEnquiries() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setEnquiries(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", margin: 0 }}>
              Admin Dashboard
            </h1>

            <p style={{ color: "#6b7280" }}>
              Manage customer enquiries
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "#111827",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Customer Enquiries
          </h2>

          {loading && <p>Loading enquiries...</p>}

          {error && (
            <p style={{ color: "red" }}>
              Error: {error}
            </p>
          )}

          {!loading && !error && enquiries.length === 0 && (
            <p>No enquiries found.</p>
          )}

          {!loading && !error && enquiries.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      ID
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Date
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Name
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Phone
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Service
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Requirement
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td style={{ padding: "12px" }}>
                        {enquiry.id}
                      </td>

                      <td style={{ padding: "12px" }}>
                        {new Date(
                          enquiry.created_at
                        ).toLocaleString()}
                      </td>

                      <td style={{ padding: "12px" }}>
                        {enquiry.name}
                      </td>

                      <td style={{ padding: "12px" }}>
                        {enquiry.phone}
                      </td>

                      <td style={{ padding: "12px" }}>
                        {enquiry.service}
                      </td>

                      <td style={{ padding: "12px" }}>
                        {enquiry.requirement}  
                      </td>

                      <td style={{ padding: "12px" }}>
                        {enquiry.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}