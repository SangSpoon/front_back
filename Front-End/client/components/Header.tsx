// // src/components/Header.tsx
// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Droplets, Settings, LogOut } from "lucide-react";

// export default function Header() {
//   const navigate = useNavigate();
//   const { logout } = useAuth();

//   const handleLogout = async () => {
//     await logout();
//     navigate("/");
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//       <div className="mx-auto max-w-7xl px-4 md:px-10 py-4 flex items-center justify-between">
//         {/* Left: Logo */}
//         <button
//           className="flex items-center space-x-3 group"
//           aria-label="현장 관리로 이동"
//           title="현장 관리로 이동"
//           onClick={() => navigate("/sites")}
//         >
//           <Droplets className="h-9 w-9 text-blue-600 group-hover:scale-105 transition-transform" />
//           <div className="flex items-baseline gap-2">
//             <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight group-hover:opacity-90">
//               수질 모니터링
//             </h1>
//             <Badge variant="outline" className="px-2 py-0.5 text-[10px] sm:text-xs">
//               실시간 현황
//             </Badge>
//           </div>
//         </button>

//         {/* Center: Navigation */}
//         <nav className="hidden md:flex items-center gap-12 md:gap-24 lg:gap-36">
//           <NavLink
//             to="/sites"
//             className={({ isActive }) =>
//               `font-semibold tracking-wide text-sm sm:text-base md:text-lg transition-colors ${
//                 isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
//               }`
//             }
//           >
//             현장 관리
//           </NavLink>
//           <NavLink
//             to="/statistics"
//             className={({ isActive }) =>
//               `font-semibold tracking-wide text-sm sm:text-base md:text-lg transition-colors ${
//                 isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
//               }`
//             }
//           >
//             통계
//           </NavLink>
//           <NavLink
//             to="/settings"
//             className={({ isActive }) =>
//               `font-semibold tracking-wide text-sm sm:text-base md:text-lg transition-colors ${
//                 isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
//               }`
//             }
//           >
//             마이페이지
//           </NavLink>
//         </nav>

//         {/* Right: Settings & Logout */}
//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => navigate("/settings")}
//             title="설정"
//           >
//             <Settings className="h-5 w-5" />
//           </Button>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={handleLogout}
//             title="로그아웃"
//           >
//             <LogOut className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// }
