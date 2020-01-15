import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// Add your Firebase credentials
firebase.initializeApp({
    apiKey: 'AIzaSyAnzHl4xoddlWj6j4OjIpg3kqiyAx_9I3Y',
    authDomain: 'gebedsmarathon.firebaseapp.com',
    databaseURL: 'https://gebedsmarathon.firebaseio.com',
    projectId: 'gebedsmarathon',
    storageBucket: 'gebedsmarathon.appspot.com',
    messagingSenderId: '321622826585',
    appId: '1:321622826585:web:9937e5288d41ad2174db48',
    measurementId: 'G-Q4PCBRB9KR',
})

const auth = firebase.auth()
firebase.auth().languageCode = 'nl'

const database = firebase.firestore()

export { auth, database }
