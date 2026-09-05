const firebaseConfig = {
  apiKey: "AIzaSyDM13kU5-lT7DSlsCp2tVCZkMVAymlzHNg",
  authDomain: "mcq-6to12.firebaseapp.com",
  projectId: "mcq-6to12",
  storageBucket: "mcq-6to12.firebasestorage.app",
  messagingSenderId: "784808401512",
  appId: "1:784808401512:web:7ab4aaa43f20aeab9739dd"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
