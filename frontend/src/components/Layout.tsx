import { Box } from "@mui/material";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <Box className="min-h-screen bg-gray-50">
      <Navbar />
      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
}

