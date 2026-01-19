const http = require("http");

const BASE_URL = "localhost:3002";

function makeRequest(method, path, body = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3002,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (cookies) {
      options.headers.Cookie = cookies;
    }

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function test() {
  console.log("\n=== Testing Authentication Flow ===\n");

  // Step 1: Register
  console.log("Step 1: Registering user...");
  const registerBody = {
    0: {
      jsonrpc: "2.0",
      method: "mutation",
      params: {
        path: "auth.register",
        input: {
          username: "testuser789",
          password: "password123",
        },
      },
      id: 1,
    },
  };

  const registerRes = await makeRequest(
    "POST",
    "/trpc/auth.register?batch=1",
    registerBody
  );
  console.log("Register status:", registerRes.status);
  try {
    const parsedReg = JSON.parse(registerRes.body);
    console.log("Register success:", !parsedReg[0].error);
  } catch (e) {
    console.log("Register response:", registerRes.body.substring(0, 200));
  }

  // Step 2: Login
  console.log("\nStep 2: Logging in...");
  const loginBody = {
    0: {
      jsonrpc: "2.0",
      method: "mutation",
      params: {
        path: "auth.login",
        input: {
          username: "testuser789",
          password: "password123",
        },
      },
      id: 2,
    },
  };

  const loginRes = await makeRequest(
    "POST",
    "/trpc/auth.login?batch=1",
    loginBody
  );
  console.log("Login status:", loginRes.status);
  console.log("Set-Cookie header type:", Array.isArray(loginRes.headers["set-cookie"]) ? "array" : "string");
  console.log("Set-Cookie header:", loginRes.headers["set-cookie"]);

  // Extract cookie properly
  let cookieString = null;
  const setCookieHeader = loginRes.headers["set-cookie"];
  if (setCookieHeader) {
    if (Array.isArray(setCookieHeader)) {
      // Array of cookies
      cookieString = setCookieHeader
        .map((c) => c.split(";")[0])
        .join("; ");
    } else {
      // Single cookie string
      cookieString = setCookieHeader.split(";")[0];
    }
  }
  console.log("Extracted cookie string:", cookieString);

  try {
    const parsedLogin = JSON.parse(loginRes.body);
    console.log("Login response[0].result:", parsedLogin[0].result);
  } catch (e) {
    console.log("Login response:", loginRes.body.substring(0, 200));
  }

  // Step 3: Submit form
  console.log("\nStep 3: Submitting application (with cookies)...");
  const formBody = {
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
  };

  const formRes = await makeRequest(
    "POST",
    "/trpc/applications.create?batch=1",
    formBody,
    cookieString
  );
  console.log("Form status:", formRes.status);
  try {
    const parsedForm = JSON.parse(formRes.body);
    if (parsedForm[0].error) {
      console.log("Form error:", parsedForm[0].error.message);
    } else {
      console.log("Form success:", !!parsedForm[0].result);
    }
  } catch (e) {
    console.log("Form response:", formRes.body.substring(0, 300));
  }
}

test().catch(console.error);
