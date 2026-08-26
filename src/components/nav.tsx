import Link from "next/link";
import Image from "next/image";
import { MSM_LOGO_DATA_URI } from "@/lib/logo";
import type { User } from "@prisma/client";
import { logout } from "@/app/logout/actions";

export function Nav({ user }: { user: User }) {
  const isAdmin = user.role === "ADMIN";
  return (
    <header className="sticky top-0 z-30 border-b border-gray-300 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <Image src={MSM_LOGO_DATA_URI} alt="MSM Unify" width={112} height={36} className="h-7 w-auto" priority unoptimized />
          <span className="hidden h-5 w-px bg-gray-300 sm:block" />
          <span className="hidden text-sm font-semibold tracking-tight text-gray-500 sm:block">
            Unify Beginnings
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-gray-700">
          {!isAdmin && (
            <>
              <Link href="/dashboard" className="hover:text-brand-red">
                My Path
              </Link>
              {user.track === "LEADERSHIP" && (
                <Link href="/leadership-portal" className="hover:text-brand-red">
                  Leadership Portal
                </Link>
              )}
            </>
          )}
          {isAdmin && (
            <>
              <Link href="/admin" className="hover:text-brand-red">
                Mission Score
              </Link>
              <Link href="/admin/editor" className="hover:text-brand-red">
                Content Editor
              </Link>
            </>
          )}
          <span className="hidden text-gray-400 sm:inline">|</span>
          <span className="hidden text-gray-500 sm:inline">{user.name}</span>
          <form action={logout}>
            <button className="text-gray-500 hover:text-brand-red">Sign out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
