import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlexTracker | Premium Gym Workout Logger",
  description: "Track your workouts, log reps, sets, and weights, save drafts, and build your physique with a state-of-the-art interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
