import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { isAuthorized } from "@/util/user-util";

function RouteGuard({ children }: any) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // on initial load - run auth check
    authCheck(router.asPath);

    // on route change start - hide page content by setting authorized to false
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route change complete - run auth check
    router.events.on("routeChangeComplete", authCheck);

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function authCheck(url: string) {
    const publicPaths = ["/login", "/activate-account", "/handle-forgotpassword"];
    const path = url.split("?")[0];
    // redirect to Login page if accessing a private page and not logged in
    if (!isAuthorized() && !publicPaths.includes(path)) {
      setAuthorized(false);
      router.push({
        pathname: "/login",
        query: { returnUrl: router.asPath },
      });
    } else {
      setAuthorized(true);
    }
  }
  return authorized && children;
}

export { RouteGuard };
