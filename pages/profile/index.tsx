// pages/profile/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProfileIndex() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.replace("/login");
      return;
    }
    const { username } = JSON.parse(atob(token.split(".")[1]));
    router.replace(`/profile/${username}`);
  }, [router]);

  return null;
}
