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
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║       اختبار شامل للنظام - Complete System Test          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    // Step 1: Register a new user
    console.log("📝 الخطوة 1: تسجيل مستخدم جديد");
    const username = "testuser" + Date.now();
    const password = "TestPassword123";

    const registerBody = {
      0: {
        jsonrpc: "2.0",
        method: "mutation",
        params: {
          path: "auth.signup",
          input: {
            username,
            password,
            studentId: "12345678",
          },
        },
        id: 1,
      },
    };

    const registerRes = await makeRequest(
      "POST",
      "/trpc/auth.signup?batch=1",
      registerBody
    );

    if (registerRes.status !== 200) {
      throw new Error(`Registration failed with status ${registerRes.status}`);
    }

    const registerData = JSON.parse(registerRes.body);
    if (registerData[0].error) {
      throw new Error(`Registration error: ${registerData[0].error.message}`);
    }

    console.log(`✅ تم إنشاء مستخدم جديد: ${username}`);

    // Step 2: Login
    console.log("\n🔑 الخطوة 2: تسجيل الدخول");

    const loginBody = {
      0: {
        jsonrpc: "2.0",
        method: "mutation",
        params: {
          path: "auth.login",
          input: {
            username,
            password,
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

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginData = JSON.parse(loginRes.body);
    if (loginData[0].error) {
      throw new Error(`Login error: ${loginData[0].error.message}`);
    }

    console.log(`✅ تم تسجيل الدخول بنجاح`);

    // Extract cookie
    let cookieString = null;
    const setCookieHeader = loginRes.headers["set-cookie"];
    if (setCookieHeader) {
      if (Array.isArray(setCookieHeader)) {
        cookieString = setCookieHeader
          .map((c) => c.split(";")[0])
          .join("; ");
      } else {
        cookieString = setCookieHeader.split(";")[0];
      }
    }

    if (!cookieString) {
      throw new Error("No session cookie received from login!");
    }

    console.log(`✅ تم استقبال ملف تعريف الجلسة`);

    // Step 3: Get authenticated user info
    console.log("\n👤 الخطوة 3: التحقق من بيانات المستخدم");

    const meBody = {
      0: {
        jsonrpc: "2.0",
        method: "query",
        params: {
          path: "auth.me",
          input: {},
        },
        id: 3,
      },
    };

    const meRes = await makeRequest(
      "POST",
      "/trpc/auth.me?batch=1",
      meBody,
      cookieString
    );

    if (meRes.status !== 200) {
      throw new Error(`Auth.me failed with status ${meRes.status}`);
    }

    const meData = JSON.parse(meRes.body);
    if (meData[0].error) {
      throw new Error(`Auth.me error: ${meData[0].error.message}`);
    }

    const user = meData[0].result;
    console.log(`✅ تم التحقق من المستخدم: ${user.username}`);

    // Step 4: Submit an application
    console.log("\n📋 الخطوة 4: تقديم طلب سكن");

    const formBody = {
      0: {
        jsonrpc: "2.0",
        method: "mutation",
        params: {
          path: "applications.create",
          input: {
            studentType: "new",
            fullName: "أحمد محمد علي",
            studentId: "12345678",
            phone: "01234567890",
            major: "الهندسة",
            gpa: "3.8",
            address: "شارع النيل",
            governorate: "cairo",
            familyIncome: "متوسط",
          },
        },
        id: 4,
      },
    };

    const formRes = await makeRequest(
      "POST",
      "/trpc/applications.create?batch=1",
      formBody,
      cookieString
    );

    if (formRes.status !== 200) {
      throw new Error(
        `Application submission failed with status ${formRes.status}`
      );
    }

    const formData = JSON.parse(formRes.body);
    if (formData[0].error) {
      throw new Error(`Application error: ${formData[0].error.message}`);
    }

    const application = formData[0].result.application;
    console.log(`✅ تم تقديم الطلب بنجاح (ID: ${application.id})`);

    // Step 5: List applications
    console.log("\n📊 الخطوة 5: الاستعلام عن الطلبات");

    const listBody = {
      0: {
        jsonrpc: "2.0",
        method: "query",
        params: {
          path: "applications.list",
          input: {},
        },
        id: 5,
      },
    };

    const listRes = await makeRequest(
      "POST",
      "/trpc/applications.list?batch=1",
      listBody,
      cookieString
    );

    if (listRes.status !== 200) {
      throw new Error(`List failed with status ${listRes.status}`);
    }

    const listData = JSON.parse(listRes.body);
    if (listData[0].error) {
      throw new Error(`List error: ${listData[0].error.message}`);
    }

    const applications = listData[0].result;
    console.log(
      `✅ تم استرجاع ${applications.length} طلب(ات) للمستخدم`
    );

    applications.forEach((app, idx) => {
      console.log(
        `   ${idx + 1}. ${app.fullName} - الحالة: ${app.status || "جديد"}`
      );
    });

    // Step 6: Get specific application
    console.log("\n🔍 الخطوة 6: الاستعلام عن تفاصيل الطلب");

    const detailsBody = {
      0: {
        jsonrpc: "2.0",
        method: "query",
        params: {
          path: "applications.getById",
          input: { id: application.id },
        },
        id: 6,
      },
    };

    const detailsRes = await makeRequest(
      "POST",
      "/trpc/applications.getById?batch=1",
      detailsBody,
      cookieString
    );

    if (detailsRes.status !== 200) {
      throw new Error(`Get details failed with status ${detailsRes.status}`);
    }

    const detailsData = JSON.parse(detailsRes.body);
    if (detailsData[0].error) {
      throw new Error(`Get details error: ${detailsData[0].error.message}`);
    }

    const details = detailsData[0].result;
    console.log(`✅ تم استرجاع تفاصيل الطلب:`);
    console.log(`   • الاسم: ${details.fullName}`);
    console.log(`   • رقم الهاتف: ${details.phone}`);
    console.log(`   • التخصص: ${details.major}`);
    console.log(`   • المحافظة: ${details.governorate}`);

    // Final summary
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    ✅ جميع الاختبارات نجحت!                  ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("📌 ملخص النتائج:");
    console.log(`   • تسجيل مستخدم جديد ..................... ✅`);
    console.log(`   • تسجيل الدخول .......................... ✅`);
    console.log(`   • التحقق من بيانات المستخدم ............ ✅`);
    console.log(`   • تقديم طلب سكن جديد ................... ✅`);
    console.log(`   • الاستعلام عن الطلبات ................. ✅`);
    console.log(`   • الاستعلام عن تفاصيل الطلب ............ ✅\n`);

    console.log("🎉 النظام يعمل بشكل صحيح تماماً!");
  } catch (error) {
    console.error("\n❌ خطأ أثناء الاختبار:");
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

test().catch(console.error);
