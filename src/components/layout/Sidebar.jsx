import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/boards", label: "Home" },
  { path: "/admin/boards", label: "Manage Boards" },
];

const Sidebar = () => {
  return (
    <aside className="w-52 min-h-[calc(100vh-49px)] bg-white border-r border-gray-200 p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
