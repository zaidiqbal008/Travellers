import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import logo from "./logo.png";

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const buttonStyles = (path) => ({
    "&:hover": { backgroundColor: "#3a60aa", color: "white" },
    backgroundColor: isActive(path) ? "#F3BD00" : "inherit",
    color: isActive(path) ? "white" : "inherit",
  });

  return (
    <AppBar position="static" sx={{ backgroundColor: "white", color: "black" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 1 }}>
        <Button component={Link} to="/" sx={{ p: 0 }}>
          <img src={logo} alt="Logo" style={{ height: 70 }} />
        </Button>

        <Box sx={{ display: "flex", gap: 2, flexGrow: 1, justifyContent: "center" }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={buttonStyles("/")}
            aria-current={isActive("/") ? "page" : undefined}
          >
            Home
          </Button>

          <Button
            component={Link}
            to="/services"
            color="inherit"
            sx={buttonStyles("/services")}
            aria-current={isActive("/services") ? "page" : undefined}
          >
            Services
          </Button>

          <Button
            component={Link}
            to="/about"
            color="inherit"
            sx={buttonStyles("/about")}
            aria-current={isActive("/about") ? "page" : undefined}
          >
            About Us
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link}
            to="/login"
            sx={{
              color: "#FFFFFF",
              backgroundColor: "#3a60aa",
              "&:hover": { backgroundColor: "#F3BD00" },
              pl:3,
              pr:3,
              mr:10
            }}
          >
            Login
          </Button>
          
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;