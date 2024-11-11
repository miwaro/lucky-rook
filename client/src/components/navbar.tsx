import React from "react";
// import { Link } from "react-router-dom";
import Header from "./header";

const Navbar: React.FC = () => {
  return (
    <div className="w-screen border-b border-stone-50 px-8">
      <nav className="flex items-center justify-between p-4 text-stone-50">
        <div className="flex items-center">
          <Header />
        </div>
        <ul className="flex space-x-12 cursor-pointer">
          <li>
            <div className="hover:text-gray-400">Rules</div>
          </li>
          <li>
            <div className="hover:text-gray-400">Key</div>
          </li>
          {/* TODO: Add a strategy read more section in the rules sidebar */}
          {/* <li>
            <div className="hover:text-gray-400">Strategy</div>
          </li> */}
          <li>
            <div className="hover:text-gray-400">Sign In</div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
