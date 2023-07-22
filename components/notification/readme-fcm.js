https://www.freecodecamp.org/news/how-to-add-push-notifications-to-a-web-app-with-firebase-528a702e13e1
// front side

// fcm 10.0 버전에 맞는 가이드 필요

// 1. npm install firebase

// 2. create a file inside the project directory and passes the keys of your project.
//    push-notification.js

// import firebase from 'firebase';

// export const initializeFirebase = () => {
//   firebase.initializeApp({
//     messagingSenderId: "your messagingSenderId"
//   });
// }

// 3. Inside the entry point of your project
// import { initializeFirebase } from './push-notification';
// ...
// ...

// initializeFirebase();

// 4. service worker is a script that your browser runs in the background, 
// To receive the onMessage event, your app needs a service worker. 
// inside the public folder with the following content:

// importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// firebase.initializeApp({
//     messagingSenderId: "your messagingSenderId again"
// });

// const messaging = firebase.messaging();

// 5. Let the user choose whether or not to receive notifications (get device's token, should keep it to database)
// Inside our push-notification.js file, add the function:

// export const askForPermissioToReceiveNotifications = async () => {
//     try {
//       const messaging = firebase.messaging();
//       await messaging.requestPermission();
//       const token = await messaging.getToken();
//       console.log('token do usuário:', token);

//       return token;
//     } catch (error) {
//       console.error(error);
//     }
//   }

// 6. call this function from somewhere, so I’ll add it at the click of a button.

// import React from 'react';
// import { askForPermissioToReceiveNotifications } from './push-notification';


// const NotificationButton = () => (
//     <button onClick={askForPermissioToReceiveNotifications} >
//       Clique aqui para receber notificações
//     </button>
// );

// export default NotificationButton;

Server Side

// 7. Sending notifications
// POST in postman or server

// HEADER
// Content-Type: application/json
// Authorization: key=SERVER_KEY


// BODY:Raw

// {
//     "notification": {
//         "title": "Firebase",
//         "body": "Firebase is awesome",
//         "click_action": "http://localhost:3000/",
//         "icon": "http://url-to-an-icon/icon.png"
//     },
//     "to": "USER TOKEN"
// }

// 8. Send notifications to a group of users
// send a POST request to the address
// https://iid.googleapis.com/iid/v1/TOKEN/rel/topics/TOPIC_NAME,

// {
//     "notification": {
//         "title": "Firebase",
//         "body": "Firebase topic message",
//         "click_action": "http://localhost:3000/",
//         "icon": "http://localhost:3000/icon.png"
//     },
//     "to": "/topics/TOPIC_NAME"
// }