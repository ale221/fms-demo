export const environment = {
  production: true,
  // baseUrl: 'http://52.157.78.199:8080',
  // baseUrl: 'http://51.124.10.14:8080',
  // baseUrl:'http://dev.iot.vodafone.com.qa:8080',
  baseUrl: 'https://fms.backend.iot.vodafone.com.qa',
  // sanpToRoadUrl: 'https://roads.googleapis.com/'
  sanpToRoadUrl: 'https://fms.backend.iot.vodafone.com.qa:5000/match/v1/driving/',
  translateUrl: '/assets/i18n/',
  signalR: 'https://broadcaster.iot.vodafone.com.qa'
};


// export const firebaseConfig = {
//   apiKey: "AIzaSyDoU99niU2pHgMubeK_sG8XId-3LF4NhRI",
//   authDomain: "vodafone-platform.firebaseapp.com",
//   databaseURL: "https://vodafone-platform-default-rtdb.firebaseio.com",
//   projectId: "vodafone-platform",
//   storageBucket: "vodafone-platform.appspot.com",
//   messagingSenderId: "1035844674036",
//   appId: "1:1035844674036:web:849a59202d75378f60d9a1",
//   measurementId: "G-HFSXDQGLBN"
// };

export const firebaseConfig = {
  apiKey: "AIzaSyCMYNLiXRHckfrihsuEO-ISo6P6vNWpU-U",
  authDomain: "vfq-iot.firebaseapp.com",
  databaseURL: "https://vfq-iot-default-rtdb.firebaseio.com",
  projectId: "vfq-iot",
  storageBucket: "vfq-iot.appspot.com",
  messagingSenderId: "302255213163",
  appId: "1:302255213163:web:239a454b377e2e1ce1bf2e",
  measurementId: "G-541W0BSB8K"
};
