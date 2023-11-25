import { HomePage } from "./pages/HomePage.tsx";
// import { RegisterPage } from "./pages/auth/RegisterPage.tsx";
// import { LoginPage } from "./pages/auth/LoginPage.tsx";
import {
  Navigate,
  Route,
  RouteProps,
  Routes,
  useLocation,
} from "react-router-dom";

export type RouteConfig = RouteProps & {
  /**
   * Required route path.   * E.g. /home   */
  path: string;
  /**
   * Specify a private route if the route
   should only be accessible for authenticated users   */
  isPrivate?: boolean;
};
export const routes: RouteConfig[] = [
  {
    isPrivate: true,
    path: "/",
    element: <Navigate to="/home" replace />,
    index: true,
  },
  {
    isPrivate: true,
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/auth/login",
    // element: <LoginPage />,
  },
  {
    path: "/auth/register",
    // element: <RegisterPage />,
  },
];

export interface AuthRequiredProps {
  to?: string;
  children?: React.ReactNode;
}

export const AuthRequired: React.FC<AuthRequiredProps> = ({
  children,}) => {
  useLocation();

  return <>{children}</>;
};

const renderRouteMap = (route: RouteConfig) => {
  const { isPrivate, element, ...rest } = route;
  console.log("isPrivate", isPrivate);
  const authRequiredElement = isPrivate ? (
    <AuthRequired>{element}</AuthRequired>
  ) : (
    element
  );
  return <Route key={route.path} element={authRequiredElement} {...rest} />;
};
export const AppRoutes = () => {
  return <Routes>{routes.map(renderRouteMap)}</Routes>;
};
