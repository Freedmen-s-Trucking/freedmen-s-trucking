import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { CustomFlowbiteTheme, Flowbite } from "flowbite-react";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useEffect } from "react";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCI2TUc2kkNiuWrtxwq4LVbR78L74q9FVo",
  authDomain: "freedman-trucking-dev.firebaseapp.com",
  projectId: "freedman-trucking-dev",
  storageBucket: "freedman-trucking-dev.firebasestorage.app",
  messagingSenderId: "1086669009589",
  appId: "1:1086669009589:web:dcce30756319cd3e4fc4fc",
  measurementId: "G-GLHDQL5M81",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const flowbittheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary: "bg-red-500 hover:bg-red-600",
    },
  },
};
const Component: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    logEvent(analytics, "screen_view", {
      firebase_screen: location.pathname,
      firebase_screen_class: location.pathname,
    });
  }, [location.pathname]);
  return (
    <>
      <Flowbite theme={{ theme: flowbittheme }}>
        <Outlet />
        <TanStackRouterDevtools />
      </Flowbite>
    </>
  );
};
export const Route = createRootRoute({
  component: Component,
});
