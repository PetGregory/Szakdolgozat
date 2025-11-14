

import { initializeApp } from "firebase/app";

import { getFirestore, doc, setDoc } from "firebase/firestore";

import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyA7fxhGCRPovz6oeeCFVax47LnOS5GYrPQ",
  authDomain: "bestrong-74932.firebaseapp.com",
  projectId: "bestrong-74932",
  storageBucket: "bestrong-74932.firebasestorage.app",
  messagingSenderId: "337747001971",
  appId: "1:337747001971:web:850508325def8987256006"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const data = JSON.parse(fs.readFileSync("workoutData.json", "utf8"));

async function uploadData() {
  try {

    console.log("Uploading exerciseData...");

    await setDoc(doc(db, "exerciseData", "default"), data);

    console.log("exerciseData uploaded successfully!");
  } catch (err) {

    console.error("Error uploading data:", err);
  }
}

uploadData();
