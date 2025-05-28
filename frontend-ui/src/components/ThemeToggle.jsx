import React from "react";

export default function ThemeToggle() {
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  };

  React.useEffect(() => {
    if (localStorage.theme === "dark") document.documentElement.classList.add("dark");
  }, []);

  return (
    <button
      onClick={toggle}
      className="text-sm px-3 py-1 border rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
      title="Toggle dark mode"
    >
      🌙/☀
    </button>
  );
}

