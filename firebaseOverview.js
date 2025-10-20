<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDoHH-vJauXYeedTJfg5e94Dn8KAPHzd1o",
    authDomain: "adaptedtrial.firebaseapp.com",
    projectId: "adaptedtrial",
    storageBucket: "adaptedtrial.firebasestorage.app",
    messagingSenderId: "730887940413",
    appId: "1:730887940413:web:121f43007b9d9a8d3ebd54",
    measurementId: "G-26W4R6H7T6"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>