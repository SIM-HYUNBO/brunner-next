'use strict'

import * as  firebase from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
    return getMessaging();
}

export const askForPermissionToReceiveNotifications = async (messaging) => {
    try {
        if (!Notification) {
            return;
        }
        if (Notification.permission !== 'granted') {
            // Chrome - 유저에게 푸시 알림을 허용하겠냐고 물어보고, 허용하지 않으면 return!
            try {
                Notification.requestPermission().then((permission) => {
                    if (permission !== 'granted') return;
                })
            } catch (error) {
                // Safari - 유저에게 푸시 알림을 허용하겠냐고 물어보고, 허용하지 않으면 return!
                if (error instanceof TypeError) {
                    Notification.requestPermission().then((permission) => {
                        if (permission !== 'granted') return;
                    });
                } else {
                    console.error(error)
                }
            }
        }
        const permissions = {
            alert: true,
            badge: true,
            sound: true,
        }
        const token = await getToken(messaging);
        console.log(`Your token is:${token}`);

        return token;
    } catch (error) {
        console.error(error);
    }
}

export const onMessageListener = (messaging) =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });