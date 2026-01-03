// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDgm2UamG7ctqNSbisMPvmVcT_CsOBBb8U",
  authDomain: "signuplogin-7e038.firebaseapp.com",
  projectId: "signuplogin-7e038",
  storageBucket: "signuplogin-7e038.firebasestorage.app",
  messagingSenderId: "104490068108",
  appId: "1:104490068108:web:4c28419a733177362c33a9",
  measurementId: "G-D84GRQB0F5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ================= ELEMENTS =================
const signupForm = document.getElementById("signupForm");
const googleSignupBtn = document.getElementById("googleSignup");

// ================= NORMAL SIGNUP (OPTIONAL EMAIL) =================
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !mobile) return alert("Name and Mobile are required!");

  if (email) {
    try {
      // Temporary password for email signup
      const tempPassword = Math.random().toString(36).slice(-8);
      const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
      await userCredential.user.updateProfile({ displayName: name });
      alert(`Signup successful! Check your email for login details.`);
      window.location.href = "login.html";
    } catch (err) {
      alert("Email signup failed: " + err.message);
    }
  } else {
    // Phone signup (OTP)
    phoneSignup(name, mobile);
  }
});

// ================= GOOGLE SIGNUP =================
googleSignupBtn.addEventListener("click", () => {
  auth.signInWithPopup(googleProvider)
    .then(result => {
      alert("Google signup successful!");
      window.location.href = "index.html";
    })
    .catch(err => alert("Google signup failed: " + err.message));
});

// ================= PHONE SIGNUP (OTP) =================
async function phoneSignup(name, mobile) {
  const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  try {
    const confirmationResult = await auth.signInWithPhoneNumber(mobile, recaptchaVerifier);
    const code = prompt("Enter OTP received on your phone:");
    const result = await confirmationResult.confirm(code);
    await result.user.updateProfile({ displayName: name });
    alert("Phone signup successful!");
    window.location.href = "index.html";
  } catch (err) {
    alert("Phone signup failed: " + err.message);
  }
}
