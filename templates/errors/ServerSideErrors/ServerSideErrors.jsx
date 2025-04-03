import React, { useEffect, useState } from "react";

const defaultMessages = {
  500: "Internal Server Error: The server encountered an unexpected condition.",
  501: "Not Implemented: The server does not support the functionality required.",
  502: "Bad Gateway: The server received an invalid response from the upstream server.",
  503: "Service Unavailable: The server is currently unavailable (overloaded or down).",
  504: "Gateway Timeout: The server didn't receive a timely response from the upstream server."
};

const ServerSideErrors = ({
  errorCode = 500,
  customMessage,
  onGoBack,
  onRetry,
  themeMode = "system",
  bgImageLight = "",
  bgImageDark = "",
  overrideLightColor = "#f8f9fa",
  overrideDarkColor = "#121212",
  customTextColor,
  customAccentColor,
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
      
      const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e) => setIsDarkMode(e.matches);
      
      darkModeMediaQuery.addEventListener("change", handleChange);
      return () => darkModeMediaQuery.removeEventListener("change", handleChange);
    } else {
      setIsDarkMode(themeMode === "dark");
    }
  }, [themeMode]);

  const handleGoBack = () => {
    if (onGoBack) onGoBack();
    else window.history.back();
  };

  const handleRetry = () => {
    if (onRetry) onRetry();
    else window.location.reload();
  };

  const getTextColor = () => {
    if (customTextColor) return customTextColor;
    return isDarkMode ? "#ffffff" : "#000000";
  };

  const getAccentColor = () => {
    if (customAccentColor) return customAccentColor;
    return isDarkMode ? "#e91e63" : "#e91e63"; // Pink accent for server errors
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
      {/* Diagonal pattern background */}
      {showPatternBackground && (
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
          style={{
            backgroundImage: isDarkMode 
              ? "linear-gradient(45deg, #fff 1px, transparent 1px), linear-gradient(-45deg, #fff 1px, transparent 1px)" 
              : "linear-gradient(45deg, #000 1px, transparent 1px), linear-gradient(-45deg, #000 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      )}
      
      {/* Circle decorations */}
      <div className="absolute top-10 left-10 w-16 h-16 rounded-full border-2 dark:border-white border-black opacity-20" />
      <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full border-2 dark:border-white border-black opacity-20" />

      <div className="text-center max-w-xl relative z-10">
        <div 
          className="mb-8 -rotate-3 inline-block p-2 px-4 rounded"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.15)' : 'rgba(233, 30, 99, 0.1)',
            border: `1px solid ${getAccentColor()}33`
          }}
        >
          <h2 className="text-sm md:text-base uppercase tracking-widest font-medium" style={{ color: getAccentColor() }}>
            Server Error
          </h2>
        </div>

        <div className="relative">
          <h1 
            className="text-8xl md:text-[12rem] font-black mb-8 transform -skew-y-2"
            style={{ color: getTextColor(), textShadow: `0 5px 20px rgba(0,0,0,0.15)` }}
          >
            {errorCode}
          </h1>
          
          <div 
            className="h-1 w-24 md:w-48 mx-auto mb-12 transform rotate-2"
            style={{ backgroundColor: getAccentColor() }}
          />
        </div>
        
        <p 
          className="text-xl md:text-2xl mb-12 font-light leading-relaxed px-4"
          style={{ color: isDarkMode ? "#cccccc" : "#555555" }}
        >
          {customMessage || defaultMessages[errorCode]}
        </p>
        
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <button 
            onClick={handleRetry}
            className="px-8 py-3 text-lg font-medium rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{ 
              backgroundColor: getAccentColor(),
              color: "#ffffff",
              outline: "none" 
            }}
          >
            Try Again
          </button>
          
          <button 
            onClick={handleGoBack}
            className={`px-8 py-3 text-lg font-medium rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              isDarkMode 
                ? "bg-gray-800 text-white hover:bg-gray-700" 
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
            style={{ outline: "none" }}
          >
            Go Back
          </button>
        </div>
      </div>
      
      {/* Left and right gradient lines */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-pink-500 via-pink-300 to-purple-500 opacity-30" />
      <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-purple-500 via-pink-300 to-pink-500 opacity-30" />
    </div>
  );
};

export default ServerSideErrors;
