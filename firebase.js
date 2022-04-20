import firebase from "firebase/compat/app";
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCPTDOt7j8f8GtMXbtHNUqUkLhIXau7D4M",
    authDomain: "safer-df4a4.firebaseapp.com",
    projectId: "safer-df4a4",
    storageBucket: "safer-df4a4.appspot.com",
    messagingSenderId: "442634537732",
    appId: "1:442634537732:web:e76dfad9a5c54eb2451e51"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


const db = firebase.firestore();

export { db };