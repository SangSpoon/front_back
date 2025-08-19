// Front-End/client/components/Header.tsx
import { NavLink } from "react-router-dom";

export default function HeaderNav() {
  return (
    <nav className="hidden md:flex items-center gap-12 md:gap-24 lg:gap-36">
      <NavLink
        to="/sites"
        end
        className={({ isActive }) =>
          `font-semibold tracking-wide transition-colors
           text-sm sm:text-base md:text-lg
           ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`
        }
      >
        현장 관리
      </NavLink>

      <NavLink
        to="/statistics"
        end
        className={({ isActive }) =>
          `font-semibold tracking-wide transition-colors
           text-sm sm:text-base md:text-lg
           ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`
        }
      >
        통계
      </NavLink>

      <NavLink
        to="/settings"
        end
        className={({ isActive }) =>
          `font-semibold tracking-wide transition-colors
           text-sm sm:text-base md:text-lg
           ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`
        }
      >
        마이페이지
      </NavLink>
    </nav>
  );
}
