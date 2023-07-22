// Import the functions you need from the SDKs you need
import * as  firebase from 'firebase/app';
import { getMessaging, getToken } from "firebase/messaging";

export const initializeFirebase = () => {
    firebase.initializeApp({
        apiKey: "AIzaSyDUFumfSDDhqAHoangf1QXfa7_EMU-ShF8",
        authDomain: "brunner-push-7e0ef.firebaseapp.com",
        projectId: "brunner-push-7e0ef",
        storageBucket: "brunner-push-7e0ef.appspot.com",
        messagingSenderId: "28338539794",
        appId: "1:28338539794:web:9edc23f7cb5eb89ad0b7cb",
        measurementId: "G-B07Z61D6S6"
    });

    console.log('firebase initialized');
}

export const askForPermissionToReceiveNotifications = async () => {
    try {
        const permissions = {
            alert: true,
            badge: true,
            sound: true,
        }

        const token = await getToken(getMessaging());
        console.log('Your token is:', token);

        return token;
    } catch (error) {
        console.error(error);
    }
}
