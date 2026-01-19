#!/usr/bin/env npx ts-node
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3002";

async function test() {
  console.log("\n=== Testing Authentication Flow ===\n");

  // Step 1: Register a user
  console.log("Step 1: Register a user");
  const registerRes = await fetch(`${BASE_URL}/trpc/auth.register?batch=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      0: {
        jsonrpc: "2.0",
        method: "mutation",
        params: {
          path: "auth.register",
          input: {
            username: "testuser123",
            password: "password123",
          },
        },
        id: 1,
      },
    }),
  });

  console.log("Register status:", registerRes.status);
  const registerData = await registerRes.json();
  console.log("Register response:", JSON.stringify(registerData, null, 2));

  // Step 2: Login
  console.log("\n\nStep 2: Login");
  const loginRes = await fetch(`${BASE_URL}/trpc/auth.login?batch=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      0: {
        jsonrpc: "2.0",
        method: "mutation",
        params: {
          path: "auth.login",
          input: {
            username: "testuser123",
            password: "password123",
          },
        },
        id: 2,
      },
    }),
  });

  console.log("Login status:", loginRes.status);
  console.log("Login cookies:", loginRes.headers.get("set-cookie"));
  const loginData = await loginRes.json();
  console.log("Login response:", JSON.stringify(loginData, null, 2));

  // Extract cookies
  const setCookieHeader = loginRes.headers.get("set-cookie");
  console.log("Set-Cookie header:", setCookieHeader);

  // Step 3: Submit form with cookies
  console.log("\n\nStep 3: Submit application form (with credentials)");
  const formRes = await fetch(
    `${BASE_URL}/trpc/applications.create?batch=1`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(setCookieHeader && { Cookie: setCookieHeader.split(";")[0] }),
      },
      body: JSON.stringify({
        0: {
          jsonrpc: "2.0",
          method: "mutation",
          params: {
            path: "applications.create",
            input: {
              studentType: "old",
              fullName: "Test Student",
              studentId: "12345",
              phone: "01234567890",
              major: "Engineering",
              gpa: "3.5",
              address: "123 Test Street",
              governorate: "cairo",
              familyIncome: "Low",
            },
          },
          id: 3,
        },
      }),
    }
  );

  console.log("Form submission status:", formRes.status);
  const formData = await formRes.json();
  console.log("Form response:", JSON.stringify(formData, null, 2));
}

test().catch(console.error);
