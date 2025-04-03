import React from "react";
import { FC, useEffect, useState } from "react";

interface NotFoundProps {
  onGoBack?: () => void;
  themeMode?: "system" | "light" | "dark";
  bgImageLight?: string;
  bgImageDark?: string;
  overrideLightColor?: string;
  overrideDarkColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
  customMessage?: string;
  showPatternBackground?: boolean;
}

const NotFound: FC<NotFoundProps> = ({
  onGoBack,
  themeMode = "system",
  bgImageLight = "",
  bgImageDark = "",
  overrideLightColor = "#ffffff",
  overrideDarkColor = "#000000",
  customTextColor,
  customAccentColor,
  customMessage = "The page you're looking for doesn't exist or has been moved.",
  showPatternBackground = true
}) => {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (themeMode === "system") {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      setIsDarkMode(themeMode === "dark");
    }
  }, [themeMode]);

  // Listen for dark mode changes from system
  useEffect(() => {
    if (themeMode === "system") {
      const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      
      darkModeMediaQuery.addEventListener("change", handleChange);
      return () => darkModeMediaQuery.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const getTextColor = () => {
    if (customTextColor) return customTextColor;
    return isDarkMode ? "#ffffff" : "#000000";
  };

  const getAccentColor = () => {
    if (customAccentColor) return customAccentColor;
    return isDarkMode ? "#ffffff" : "#000000";
  };

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-700 relative overflow-hidden ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={
        isDarkMode
          ? bgImageDark
            ? { backgroundImage: `url(${bgImageDark})`, backgroundSize: "cover", backgroundColor: overrideDarkColor }
            : { backgroundColor: overrideDarkColor }
          : bgImageLight
            ? { backgroundImage: `url(${bgImageLight})`, backgroundSize: "cover", backgroundColor: overrideLightColor }
            : { backgroundColor: overrideLightColor }
      }
    >
      {/* Pattern background */}
      {showPatternBackground && (
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
          style={{
            backgroundImage: isDarkMode 
              ? "radial-gradient(#fff 1px, transparent 1px)" 
              : "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      )}
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 dark:border-white border-black opacity-30" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 dark:border-white border-black opacity-30" />

      <div className="text-center max-w-xl relative z-10">
        <div className="relative">
          <h1 
            className="text-9xl md:text-[15rem] font-black tracking-tighter mb-8"
            style={{ color: getTextColor(), textShadow: `0 10px 30px rgba(0,0,0,0.1)` }}
          >
            404
          </h1>
          
          <div 
            className="h-1 w-24 md:w-48 mx-auto mb-12"
            style={{ backgroundColor: getAccentColor() }}
          />
        </div>
        
        <p 
          className="text-xl md:text-2xl mb-12 font-light leading-relaxed px-4"
          style={{ color: isDarkMode ? "#aaaaaa" : "#555555" }}
        >
          {customMessage}
        </p>
        
        <button 
          onClick={handleGoBack}
          className={`px-8 py-3 text-lg font-medium rounded shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
            isDarkMode 
              ? "bg-white text-black hover:bg-gray-200" 
              : "bg-black text-white hover:bg-gray-800"
          }`}
          style={{ outline: "none" }}
        >
          Go Back
        </button>
      </div>
      
      {/* Top and bottom gradient lines */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-black via-gray-500 to-white dark:from-white dark:via-gray-500 dark:to-black opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-white via-gray-500 to-black dark:from-black dark:via-gray-500 dark:to-white opacity-60" />
    </div>
  );
};

export default NotFound;
