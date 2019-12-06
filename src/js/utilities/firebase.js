import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// Add your Firebase credentials
firebase.initializeApp({
    apiKey: 'AIzaSyCp0BI2EP34LinOYTaAVHZMwhlWWNT6-fI',
    authDomain: 'gebedsrooster-e99b9.firebaseapp.com',
    databaseURL: 'https://gebedsrooster-e99b9.firebaseio.com',
    projectId: 'gebedsrooster-e99b9',
    storageBucket: 'gebedsrooster-e99b9.appspot.com',
    messagingSenderId: '546240000076',
    appId: '1:546240000076:web:3862350dc691c2369e44e9',
    measurementId: 'G-Y1V8FQ2WF0',
})

const database = firebase.firestore()

export { database }
