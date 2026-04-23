import { initializeApp } from 'firebase/app'
import { getDatabase, ref as dbRef, onValue, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBJ85Cxy-n0LTKmVENhm-afPaosxuQJuBw',
  authDomain: 'tierlist-393c8.firebaseapp.com',
  databaseURL: 'https://tierlist-393c8-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'tierlist-393c8',
  storageBucket: 'tierlist-393c8.firebasestorage.app',
  messagingSenderId: '355495231607',
  appId: '1:355495231607:web:65363a9748a24ff2774672',
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export const roomRef = dbRef(db, 'rooms/default')
export { onValue, set }