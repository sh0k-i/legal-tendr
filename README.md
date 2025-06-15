# LegalTendr - Mobile-Centric UI/UX Prototype

![LegalTendr](https://placehold.co/600x200/FFCC70,C850C0,4158D0/FFFFFF/?text=LegalTendr&font=montserrat)

LegalTendr is a high-fidelity, interactive UI/UX prototype for a platform that connects clients with lawyers through an intuitive, mobile-centric interface. Similar to dating apps, it allows users to browse lawyer profiles, match with legal professionals who fit their needs, and communicate directly with them.

## Project Overview

This prototype is focused on establishing the mobile-centric look and feel, emulating a native mobile application experience, and demonstrating core navigation flows. It uses mock data exclusively and does not integrate with a live database or complex backend functions at this stage.

## Core Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (for Modals, Dialogs, Popovers, Buttons, Cards, etc.)
- **Navigation**: Next.js App Router

## UI/UX Principles

- **Mobile-Centric Design**: The interface strictly emulates a native mobile application with full-screen views, appropriate touch targets, bottom navigation for the main app, and transitions/modals typical of mobile apps.
- **Responsive Typography**: Font sizes adjust between mobile and desktop views using Inter font.
- **Gradient Palette**: Implements a consistent visual theme using the gradient: #FFCC70 (Yellow) -> #C850C0 (Pink/Purple) -> #4158D0 (Blue).
- **Component-Driven**: Utilizes Shadcn/ui components for consistency and a modern look.
- **Mock Data Driven**: All dynamic content is populated from predefined mock data structures.

## Key Features & Pages

- **Landing Page (/)**: Standard website layout with top navigation, hero section, features, and testimonials.
- **Onboarding (/onboarding)**: Multi-step flow for mock Sign Up / Login.
- **App Shell (/app/...)**: Core "mobile app" view with sticky bottom navigation dock/bar on mobile, sidebar on desktop.
- **Dashboard (/app/dashboard)**: Card-based layout showing recent cases and messages.
- **Discover (/app/discover)**: Tinder-like card stack interface for browsing lawyers.
- **My Cases (/app/my-cases)**: List view of cases with a floating action button to create new cases.
- **Case Details (/app/cases/[caseId])**: Detailed view of a specific case with matching lawyers.
- **Messages (/app/messages)**: Conversation list and chat interface.
- **Account (/app/account)**: User profile and settings.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
/src
  /app                   # Next.js app router pages
    /app                 # Mobile app views
      /dashboard         # Dashboard view
      /discover          # Discover lawyers view
      /my-cases          # Case management view
      /cases             # Case detail views
      /messages          # Messaging interface
      /account           # User profile
    /onboarding          # User onboarding flow
    /about               # About page
    /blog                # Blog page
    /faq                 # FAQ page
  /components            # Reusable UI components
    /layout              # Layout components like bottom-nav
    /ui                  # Shadcn UI components
  /lib                   # Utility functions and mock data
    /mock-data           # Mock data for the prototype
```

## Mock Data

The prototype uses predefined mock data structures to simulate user information, lawyers, cases, messages, and other content. All data is located in `/src/lib/mock-data/index.ts`.

## Notes

- This is a prototype only and does not include actual authentication or backend integration.
- All "login" and "sign up" actions simply navigate to the app dashboard.
- The prototype demonstrates the look, feel, and navigation of the application but does not save or process real data.
