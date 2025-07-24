import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";

const MainLayout = ({ children, isSidebarOpen, toggleSidebar, isRightSidebarOpen, toggleRightSidebar }) => {
    return (
        <div style={{ position: "relative" }}>
            <Navbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isRightSidebarOpen={isRightSidebarOpen}
                toggleRightSidebar={toggleRightSidebar}
            />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <RightSidebar isOpen={isRightSidebarOpen} toggleRightSidebar={toggleRightSidebar} />

            <div className="main-content" style={{ paddingTop: "60px" }}>
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
