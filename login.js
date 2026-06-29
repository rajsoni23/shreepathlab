"true" === localStorage.getItem("loggedIn") && window.location.replace("dashboard.html");

document.getElementById("loginBtn").addEventListener("click", async () => {
  const emailVal = document.getElementById("email").value.trim().toLowerCase();
  if (!emailVal) return;
  
  try {
    const firestoreUrl = "https://firestore.googleapis.com/v1/projects/deoa-8a388/databases/(default)/documents/users/" + encodeURIComponent(emailVal);
    const response = await fetch(firestoreUrl, {
      headers: { "X-Goog-Api-Key": "" }
    });
    const data = await response.json();

    // Condition A: Agar user Firestore me exist hi nahi karta (New Sign up request)
    if (!data.fields) {
      await fetch(firestoreUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": ""
        },
        body: JSON.stringify({
          fields: {
            active: { booleanValue: false },
            status: { stringValue: "pending" }
          }
        })
      });
      alert("✅ अनुरोध सफलतापूर्वक सबमिट हो गया!\n\nआपका खाता बना दिया गया है।\n\nकृपया भुगतान पूरा करें और अपने खाते को सक्रिय कराने के लिए Administrator से संपर्क करें।");
      return;
    }

    // Condition B: User ka registration lock active false hai (Inactive Account)
    if (!data.fields.active.booleanValue) {
      alert("❌ खाता निष्क्रिय है\n\nआपका खाता निष्क्रिय (Disabled) कर दिया गया है।\n\nकृपया Administrator से संपर्क करें।");
      localStorage.clear();
      return;
    }

    // Condition C: Login Validated Successfully!
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("email", emailVal);

    // Dynamic verification parameter setup check
    if (data.fields.labName && data.fields.labName.stringValue) {
      localStorage.setItem("labSetupDone", "true");
      alert("✅ Login Successful!");
      window.location.replace("dashboard.html");
    } else {
      localStorage.setItem("labSetupDone", "false");
      alert("✅ Login Successful! Kripya apni pathology ke details ko setup karein.");
      window.location.replace("dashboard.html");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Please try again...");
  }
});
