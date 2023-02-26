import { useSession, signOut } from "next-auth/react"; // next-auth v4 에서는 next-auth/client 가 아닌 next-auth/react로 변경
import Link from "next/link";

import classes from "./main-navigation.module.css";

function MainNavigation() {
  // const [session, status] = useSession();  // next-auth v3
  const { data: session, status } = useSession(); // next-auth v4
  // console.log(status);
  // console.log(session);

  function logoutHandler() {
    signOut();
  }
  return (
    <header className={classes.header}>
      <Link href="/">
        <div className={classes.logo}>Next Auth</div>
      </Link>
      <nav>
        <ul>
          {!session && status !== "loading" && (
            <li>
              <Link href="/auth">Login</Link>
            </li>
          )}

          {session && (
            <li>
              <Link href="/profile">Profile</Link>
            </li>
          )}
          {session && (
            <li>
              <button onClick={logoutHandler}>Logout</button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
