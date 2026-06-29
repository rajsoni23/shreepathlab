(async () => {
  // Check kijiye ki user logged in hai ya nahi
  if ("true" !== localStorage.getItem("loggedIn")) {
    return void window.location.replace("login.html");
  }
  
  const cachedEmail = localStorage.getItem("email");
  if (!cachedEmail) {
    localStorage.clear();
    return void window.location.replace("login.html");
  }

  try {
    const docUrl = "https://firestore.googleapis.com/v1/projects/deoa-8a388/databases/(default)/documents/users/" + encodeURIComponent(cachedEmail);
    const serverRequest = await fetch(docUrl, {
      headers: { "X-Goog-Api-Key": "" }
    });
    const payload = await serverRequest.json();

    // Verification check A
    if (!payload.fields) {
      alert("❌ Access Denied\n\nYour Gmail is not registered.");
      localStorage.clear();
      return void window.location.replace("login.html");
    }

    // Verification check B (Active status YES/NO control)
    if (!payload.fields.active.booleanValue) {
      alert("❌ Account Inactive\n\nPlease contact the administrator.");
      localStorage.clear();
      return void window.location.replace("login.html");
    }

    console.log("License Verified Successfully via Firestore!");

    // Check kijiye ki pathology details bhari hain ya nahi
    if (payload.fields.labName && payload.fields.labName.stringValue) {
      const activeLabObject = {
        labName: payload.fields.labName.stringValue,
        labSubtitle: payload.fields.labSubtitle ? payload.fields.labSubtitle.stringValue : "",
        regNo: payload.fields.regNo ? payload.fields.regNo.stringValue : "",
        contact: payload.fields.contact ? payload.fields.contact.stringValue : "",
        branchAddress: payload.fields.branchAddress ? payload.fields.branchAddress.stringValue : "",
        headOffice: payload.fields.headOffice ? payload.fields.headOffice.stringValue : "",
        doctorName: payload.fields.doctorName ? payload.fields.doctorName.stringValue : "",
        doctorDegree: payload.fields.doctorDegree ? payload.fields.doctorDegree.stringValue : "",
        doctorRegNo: payload.fields.doctorRegNo ? payload.fields.doctorRegNo.stringValue : ""
      };
      
      // Cache me save karein taaki printPreview dynamic read kar sake
      localStorage.setItem("labProfileCache", JSON.stringify(activeLabObject));
      localStorage.setItem("labSetupDone", "true");
    } else {
      // Agar labName nahi hai toh onboarding popup generate karke screen par inject karo
      localStorage.setItem("labSetupDone", "false");
      
      let formModal = document.getElementById("onboarding-overlay-container");
      if (!formModal) {
        const divOverlay = document.createElement('div');
        divOverlay.id = "onboarding-overlay-container";
        divOverlay.style.cssText = "position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 76, 129, 0.98); z-index:99999; overflow-y:auto; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif;";
        divOverlay.innerHTML = `
          <div style="background: white; max-width: 650px; margin: 0 auto; border-radius: 16px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.4);">
            <h2 style="color: #0f4c81; margin-top: 0; margin-bottom: 5px; font-size: 24px; font-weight: 800;">🏥 Laboratory Profile Setup</h2>
            <p style="color: #555; font-size: 13px; margin-bottom: 25px; line-height: 1.5;">Aapki pathology ke ye vivran (details) aapki final patient reports ke top header (letterhead) aur signature space me dynamically automatic print honge. Kripya ise sahi se fill karein.</p>
            
            <form id="onboardingLabForm">
              <div style="margin-bottom: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Laboratory Title Name (e.g., ELITE DIAGNOSTICS)</label>
                <input type="text" id="ob-labName" required placeholder="Enter Laboratory Name" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
              </div>

              <div style="margin-bottom: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Tagline / Subtitle Subheader (e.g., and Research Centre)</label>
                <input type="text" id="ob-labSubtitle" placeholder="e.g., And Research Centre" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
              </div>

              <div style="margin-bottom: 15px; display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div>
                  <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Establishment Registration ID</label>
                  <input type="text" id="ob-regNo" required placeholder="e.g., RMEE2553538" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
                </div>
                <div>
                  <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Official Contact Number</label>
                  <input type="text" id="ob-contact" required placeholder="e.g., +91 9555573334" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Branch Center Address</label>
                <input type="text" id="ob-branchAddress" required placeholder="Full Branch Location Address" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
              </div>

              <div style="margin-bottom: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Head Office Address (Optional)</label>
                <input type="text" id="ob-headOffice" placeholder="Head Office address description if any" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
              </div>

              <h3 style="color: #2563eb; font-size:15px; border-top:1px dashed #e2e8f0; padding-top:15px; margin-top:20px; margin-bottom:12px; font-weight: 700;">✍️ Authorized Pathologist Signatory Details</h3>

              <div style="margin-bottom: 15px;">
                <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Doctor Name (e.g., Dr Sanjay Kumar Gupta)</label>
                <input type="text" id="ob-doctorName" required placeholder="Full Name of Doctor" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
              </div>

              <div style="margin-bottom: 20px; display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div>
                  <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Medical Degree (e.g., MD (PATHOLOGY))</label>
                  <input type="text" id="ob-doctorDegree" required placeholder="e.g., MD (PATHOLOGY)" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
                </div>
                <div>
                  <label style="display:block; font-weight:600; margin-bottom:6px; color:#2c3e50; font-size: 13px;">Doctor Registration/MCI No.</label>
                  <input type="text" id="ob-doctorRegNo" required placeholder="e.g., MCI Registration No. 10693" style="width:100%; padding:11px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline: none; box-sizing: border-box;">
                </div>
              </div>

              <button type="submit" style="background: #2563eb; color: white; border: none; padding: 14px; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%; font-size:15px; margin-top: 15px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">💾 Save Settings & Initialize Workspace</button>
            </form>
          </div>
        `;
        document.body.appendChild(divOverlay);
        formModal = divOverlay;
      }
      
      formModal.style.display = "block";
      InitializeOnboardingSubmissionLogic(docUrl);
    }
  } catch (error) {
    console.error("Critical Exception caught on work workflow initialization:", error);
    if (localStorage.getItem("labSetupDone") !== "true") {
      localStorage.clear();
      window.location.replace("login.html");
    }
  }
})();

// Form Submit & Firestore PATCH function
function InitializeOnboardingSubmissionLogic(targetDocumentEndpoint) {
  const targetForm = document.getElementById("onboardingLabForm");
  if (!targetForm) return;

  targetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("ob-labName").value.trim();
    const subtitle = document.getElementById("ob-labSubtitle").value.trim();
    const regId = document.getElementById("ob-regNo").value.trim();
    const phone = document.getElementById("ob-contact").value.trim();
    const branch = document.getElementById("ob-branchAddress").value.trim();
    const hOffice = document.getElementById("ob-headOffice").value.trim();
    const docName = document.getElementById("ob-doctorName").value.trim();
    const docDegree = document.getElementById("ob-doctorDegree").value.trim();
    const docReg = document.getElementById("ob-doctorRegNo").value.trim();

    const patchPayload = {
      fields: {
        active: { booleanValue: true },
        status: { stringValue: "active" },
        labName: { stringValue: name },
        labSubtitle: { stringValue: subtitle },
        regNo: { stringValue: regId },
        contact: { stringValue: phone },
        branchAddress: { stringValue: branch },
        headOffice: { stringValue: hOffice },
        doctorName: { stringValue: docName },
        doctorDegree: { stringValue: docDegree },
        doctorRegNo: { stringValue: docReg }
      }
    };

    const maskParams = "?updateMask.fieldPaths=labName" +
                       "&updateMask.fieldPaths=labSubtitle" +
                       "&updateMask.fieldPaths=regNo" +
                       "&updateMask.fieldPaths=contact" +
                       "&updateMask.fieldPaths=branchAddress" +
                       "&updateMask.fieldPaths=headOffice" +
                       "&updateMask.fieldPaths=doctorName" +
                       "&updateMask.fieldPaths=doctorDegree" +
                       "&updateMask.fieldPaths=doctorRegNo";

    try {
      const executePatch = await fetch(targetDocumentEndpoint + maskParams, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": ""
        },
        body: JSON.stringify(patchPayload)
      });

      if (executePatch.ok) {
        alert("🎉 Congratulations! Laboratory workspace initialized completely.");
        
        const localCacheStructure = { 
          labName: name, labSubtitle: subtitle, regNo: regId, contact: phone, 
          branchAddress: branch, headOffice: hOffice, doctorName: docName, 
          doctorDegree: docDegree, doctorRegNo: docReg 
        };
        
        localStorage.setItem("labProfileCache", JSON.stringify(localCacheStructure));
        localStorage.setItem("labSetupDone", "true");
        
        document.getElementById("onboarding-overlay-container").style.display = "none";
        window.location.reload(); 
      } else {
        alert("Error sending validation requests. Try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("Network fail exception occurred during profile synchronization.");
    }
  });
}

setInterval(() => { location.reload(); }, 18e5);
