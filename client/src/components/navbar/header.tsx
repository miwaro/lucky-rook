import React from "react";
import logo from "../../images/chessLogo5.png";

const Header: React.FC = () => {
  return (
    <header className="header">
      <img src={logo} alt="logo" className="h-[40px]" />
      <h1 className="pl-2 flex gap-1">
        <span>Chance</span> <span>Chess</span>
      </h1>
    </header>
  );
};

export default Header;
