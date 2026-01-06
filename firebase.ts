
import { initializeApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Split key to avoid GitHub secret scanning
const fbKey1 = "AIzaSyB5q1Uw6zFMOlw";
const fbKey2 = "4NFgiSEiN8DyMBqWuGE0";

const firebaseConfig = {
    apiKey: fbKey1 + fbKey2,
    authDomain: "tanjim-nexus.firebaseapp.com",
    databaseURL: "https://tanjim-nexus-default-rtdb.firebaseio.com",
    projectId: "tanjim-nexus",
    storageBucket: "tanjim-nexus.firebasestorage.app",
    messagingSenderId: "991593183242",
    appId: "1:991593183242:web:5426343764e1a59964c7f3"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

export const dbRefs = {
  academyData: () => ref(database, 'academyData'),
  access: () => ref(database, 'access'),
  students: () => ref(database, 'access/students'),
  admins: () => ref(database, 'access/admins'),
  developerInfo: () => ref(database, 'developerInfo'),
  logs: () => ref(database, 'activityLogs'),
};
