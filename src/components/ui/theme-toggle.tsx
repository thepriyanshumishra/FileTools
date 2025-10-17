"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setTheme(theme === "dark" ? "light" : "dark");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);

  if (!mounted) {
    return <div className={`w-20 h-9 ${className}`} />;
  }

  return (
    <div className={className}>
      <style jsx>{`
        .theme-toggle-container {
          position: relative;
          display: inline-block;
          width: 80px;
          height: 34px;
          transform: scale(0.7);
        }
        .theme-toggle-input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .theme-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: linear-gradient(skyblue, cadetblue);
          transition: 0.4s;
          overflow: hidden;
          z-index: 1;
          border-radius: 34px;
        }
        .theme-slider::before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: #ffd700;
          transition: 0.4s;
          border-radius: 50%;
          box-shadow:
            inset 0 -1px 2px #987416,
            0 1px 2px #80808077,
            0 0 0 10px #ffffff22,
            0 0 0 20px #ffffff22,
            10px 0 0 20px #ffffff22;
        }
        .theme-toggle-input:checked + .theme-slider {
          background: linear-gradient(-45deg, #222, #000030);
        }
        .theme-toggle-input:checked + .theme-slider::before {
          background: #dddddd;
          transform: translateX(180%);
          box-shadow:
            inset 0 -1px 2px #808080,
            0 1px 2px #555555,
            0 0 0 10px #ffffff22,
            0 0 0 20px #ffffff22,
            -10px 0 0 20px #ffffff22;
        }
        .theme-slider::after {
          content: "";
          position: absolute;
          background: #535370;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          bottom: 65%;
          right: 16%;
          box-shadow:
            -8px 7px 0 3px #535370,
            2px 10px 0 #535370;
          transition: .4s;
          transform: scale(0) rotate(360deg);
          filter: saturate(.75);
        }
        .theme-toggle-input:checked + .theme-slider::after {
          transform: scale(1) rotate(-24deg);
        }
        .theme-toggle-input:checked + .theme-slider .background {
          transform: translateY(260%);
          opacity: 0;
        }
        .star {
          transform: scale(0);
          transition: .4s;
        }
        .theme-toggle-input:checked + .theme-slider .star {
          position: absolute;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-bottom: 7px solid #ffffff;
          transform: scale(.3) translate(50%) rotate(35deg);
          border-top: none;
          margin: 5px 0;
        }
        .theme-toggle-input:checked + .theme-slider .star:last-child {
          transform: scale(.4) translate(225%, 300%) rotate(35deg);
        }
        .theme-toggle-input:checked + .theme-slider .star::before,
        .theme-toggle-input:checked + .theme-slider .star::after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-top: none;
        }
        .theme-toggle-input:checked + .theme-slider .star::before {
          border: 3px solid transparent;
          border-bottom: 8px solid #ffffff;
          transform: rotate(35deg);
          top: -7.5px;
          left: 1.5px;
        }
        .theme-toggle-input:checked + .theme-slider .star::after {
          border: 10px solid transparent;
          border-bottom: 7px solid #ffffff;
          transform: rotate(70deg);
          top: -7px;
          left: -4.5px;
        }
        .background {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          bottom: 0;
          right: 0;
          box-shadow:
            0 -10px 0 8px #ffffff,
            -10px 0px 0 8px #ffffff,
            -45px 4px 0 5px #ffffff,
            -60px 0px 0 3px #ffffff,
            -29px 2px 0 8px #ffffff;
          transition: .4s;
        }
      `}</style>
      <label className="theme-toggle-container">
        <input
          type="checkbox"
          className="theme-toggle-input"
          checked={theme === "dark"}
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode (Shift+Space)`}
        />
        <span className="theme-slider">
          <div className="background"></div>
          <div className="star"></div>
          <div className="star"></div>
        </span>
      </label>
    </div>
  );
}