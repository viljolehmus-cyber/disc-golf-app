import { NavLink } from "react-router-dom";
import { BarChart3, Disc, Map, User, Users } from "lucide-react";

const TABS = [
  { to: "/", label: "Play", icon: Disc, end: true },
  { to: "/courses", label: "Courses", icon: Map, end: false },
  { to: "/stats", label: "Stats", icon: BarChart3, end: false },
  { to: "/social", label: "Social", icon: Users, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false }
];

export function TabBar() {
  return (
    <nav className="hairline-t safe-b fixed inset-x-0 bottom-0 z-40 bg-app/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[600px] items-stretch">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-[3px] pb-2 pt-[9px] text-[10px] font-medium transition-colors duration-150 ${
                isActive ? "text-accent" : "text-sub"
              }`
            }
          >
            <Icon size={24} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
