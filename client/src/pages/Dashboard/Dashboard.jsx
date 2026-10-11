import React, { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import SideMenu from "../../components/Dashboard/SideMenu";
import Header from "../../components/Dashboard/Header";
import { Outlet } from "react-router-dom";
import SideMenuMobile from "../../components/Dashboard/SideMenuMobile";
import { useMediaQuery } from "@mui/material";
import { useDispatch } from "react-redux";
import { closeMobileMenu } from "../../redux/MobileMenuSlice";
import { setUser } from "../../redux/UserSlice";
import { getProfile } from "../../api/auth";
import ForumIcon from "@mui/icons-material/Forum";
import ChatBot from "../../components/ChatBot/ChatBot";

export default function Dashboard() {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const dispatch = useDispatch();
  const [openChatbot, setOpenChatbot] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      dispatch(closeMobileMenu());
    }
  }, [isMobile, dispatch]);

  

  

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (active && profile) {
          dispatch(setUser(profile));
        }
      } catch (error) {
        console.error("Could not load profile for sidebar:", error.message);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [dispatch]);

  const toggleChatbot = () => {
    setOpenChatbot((prev) => !prev);
  };

  return (
    <>
      <CssBaseline enableColorScheme />

      <Box sx={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        {}
        <Box sx={{ display: { xs: "none", md: "block" }, flexShrink: 0 }}>
          <SideMenu />
        </Box>

        {}
        <Box sx={{ display: { xs: "block", md: "none" }, flexShrink: 0 }}>
          <SideMenuMobile />
        </Box>

        {}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            minWidth: 0,
            width: 0,
            mt: { md: 9 },
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : theme.palette.background.default,
            overflowX: "hidden",
            boxSizing: "border-box",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "stretch",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              px: { xs: 1.5, sm: 2, md: 3 },
              pb: 5,
              pt: { xs: 8, md: 0 },
            }}
          >
            <Header />

            <Box sx={{ width: "100%", minWidth: 0 }}>
              <Outlet />
            </Box>
          </Stack>
        </Box>

        {}
        <ForumIcon
          onClick={toggleChatbot}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 20,
            backgroundColor: "primary.main",
            color: "#fff",
            fontSize: 45,
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0px 0px 10px 5px rgba(135, 55, 255, 0.4)",
            },
          }}
        />

        {}
        {openChatbot && (
          <Box
            sx={{
              position: "fixed",
              bottom: 80,
              right: 20,
              width: { xs: "calc(100vw - 32px)", sm: 350 },
              maxWidth: 350,
              height: 400,
              borderRadius: "8px",
              overflow: "hidden",
              zIndex: 30,
              boxShadow: 6,
            }}
          >
            <ChatBot />
          </Box>
        )}
      </Box>
    </>
  );
}