"use client";
import { Hotel, House,  Summary, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard/superadmin",
    icon: <House />,
  },
  {
    label: "Restaurants",
    href: "/dashboard/superadmin/restaurants",
    icon: <Hotel />,
  },
  {
    label: "Users",
    href: "/dashboard/superadmin/users",
    icon: <UsersRound />,
  },
  {
    label: "Reports",
    href: "/dashboard/superadmin/reports",
    icon: <Summary />,
  },
];
const Sidebar = () => {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
     
     <aside className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-[#1a0f0a] text-white flex flex-col transition-transform`}>

      {/* logo */}
      <div className="flex">
       <Link href="/dashboard/superadmin">
       </Link>
      </div>

     </aside>
    </>
  );
};

export default Sidebar;
