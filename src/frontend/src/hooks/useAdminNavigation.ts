import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAdminNavigation() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const pendingAdminNavigation = useRef(false);

  const isAuthenticated = !!identity;

  // Navigate to admin after successful login if pending
  useEffect(() => {
    if (
      pendingAdminNavigation.current &&
      loginStatus === "success" &&
      isAuthenticated
    ) {
      pendingAdminNavigation.current = false;
      navigate({ to: "/admin" });
    }
  }, [loginStatus, isAuthenticated, navigate]);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      pendingAdminNavigation.current = true;
      login();
    } else {
      navigate({ to: "/admin" });
    }
  };

  return { handleAdminClick, isAuthenticated };
}
