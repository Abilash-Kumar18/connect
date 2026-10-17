# CONNECT 💬

> **Purpose-Built, Context-Separated Duo Communication Platform**  
> *Compartmentalizing conversations into dedicated, topic-based workspaces within a single private relationship channel.*

---

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter&logoColor=white)](https://flutter.dev/)
[![Dart](https://img.shields.io/badge/Dart-3.x-0175C2?logo=dart&logoColor=white)](https://dart.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20MVVM-orange)](#system-architecture)
[![Design](https://img.shields.io/badge/Design-Material%203-7D5260?logo=materialdesign&logoColor=white)](#styling--ui)
[![Backend](https://img.shields.io/badge/Backend-Firebase%20%2F%20Supabase-FFCA28?logo=firebase&logoColor=black)](#backend--persistence)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [License](#license)

---

## 📖 Overview

Modern messaging apps cram everything between two people into a single, never-ending timeline: casual chatter, split bills, urgent errands, shared links, and meeting notes. Important information inevitably gets lost in the noise.

**CONNECT** re-imagines duo messaging by introducing **dedicated topic workspaces** inside a single private 1-on-1 channel. Whether tracking daily expenses, collaborating on study materials, or managing shared tasks, each topic stays isolated, searchable, and distraction-free.

---

## ⚠️ Problem Statement

Modern messaging applications force all communication between two individuals into a single, continuous message thread. This linear structure causes severe functional issues:

| Issue | Impact |
| :--- | :--- |
| **Information Overload & Loss** | Crucial transaction logs, split expenses, meeting reminders, and urgent tasks quickly get buried beneath casual conversation. |
| **Lack of Contextual Separation** | Users are forced to rely on inefficient text searches or external note-taking tools to retrieve numbers, lists, or past agreements. |
| **Feature Clutter** | Mainstream platforms prioritize broad-spectrum utilities (video/audio calls, stories, live location feeds, complex payment gateways) over focused, organized duo workflows. |

---

## 💡 The Solution

**CONNECT** is engineered from the ground up for pairs—couples, roommates, study partners, or co-founders—who need organization without sacrificing the intimacy and speed of a direct chat.

- 🗂️ **Dedicated Topic Workspaces**: Instantiate isolated conversation streams on the fly (e.g., *Daily Expenses*, *Xerox & Study Materials*, *Important Meetings*, *Casual Chat*).
- 📌 **Focused Messaging & Pinning**: Pin high-priority topic channels to the top of the workspace to prevent critical workflows from being displaced.
- 🧘 **Distraction-Free Environment**: Intentionally excludes video calls, audio calls, live location feeds, and complex third-party payment rails to maintain a lightweight, laser-focused productivity flow.
- 📱💻 **Adaptive Multi-Platform UI**: Provides an adaptive dual-pane sidebar/chat layout on desktop and web screens, and a smooth, collapsible slide-over drawer on mobile devices.

---

## ✨ Key Features

- **Topic Compartmentalization**: Create focused sub-channels inside your duo space with custom tags, icons, and colors.
- **Contextual Badges & Metadata**: Tag messages with expense sums, todo items, or deadline tags directly within topic streams.
- **Offline-First Resilience**: Messages and channel states cache locally for immediate retrieval even without an active internet connection.
- **Real-Time Synchronization**: Instant WebSocket-based real-time updates for messages, reactions, and channel status.
- **Responsive Layout Engine**: Effortless transition between desktop multi-column panels and mobile-friendly gesture-driven drawers.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework**: [Flutter](https://flutter.dev/) (Dart 3+)
- **Architecture**: Clean Architecture / MVVM
- **State Management**: [Bloc](https://bloclibrary.dev/) / [Riverpod](https://riverpod.dev/) / [Provider](https://pub.dev/packages/provider)
- **UI Components & Styling**: Material 3, [Google Fonts](https://pub.dev/packages/google_fonts), [Cupertino Icons](https://pub.dev/packages/cupertino_icons)

### Backend & Persistence
- **Backend & Real-Time Sync**: [Supabase](https://supabase.com/) / [Firebase](https://firebase.google.com/) (Realtime Database & Authentication)
- **Local Storage & Cache**: [Hive](https://pub.dev/packages/hive) / [SharedPreferences](https://pub.dev/packages/shared_preferences)

---

## 🏗️ System Architecture

CONNECT follows **Clean Architecture** principles, maintaining strict separation between the Presentation, Domain/Business Logic, and Data layers.

```
+-----------------------------------------------------------------------------------+
|                        1. PRESENTATION LAYER (Flutter UI)                         |
|                                                                                   |
|   +-----------------------+     +---------------------------------------------+   |
|   |   Splash & Auth View  | --> |        Responsive Navigation Shell          |   |
|   +-----------------------+     +---------------------------------------------+   |
|                                        |                                          |
|            +---------------------------+---------------------------+              |
|            v                                                       v              |
|   +-----------------------------+                 +---------------------------+   |
|   |  Topic Sidebar / Drawer     |                 |  Dedicated Chat Pane      |   |
|   |  - Channel List & Pinning   |                 |  - Message Bubbles        |   |
|   |  - Add Topic Button         |                 |  - Expense / Task Badges  |   |
|   +-----------------------------+                 +---------------------------+   |
+-----------------------------------------------------------------------------------+
                                       | ^
                                       v |
+-----------------------------------------------------------------------------------+
|                   2. BUSINESS LOGIC & STATE (Bloc / Riverpod)                     |
|                                                                                   |
|   +-------------------+     +-----------------------+     +-------------------+   |
|   |  Auth Controller  |     |   Channel Controller  |     | Message Controller|   |
|   +-------------------+     +-----------------------+     +-------------------+   |
+-----------------------------------------------------------------------------------+
                                       | ^
                                       v |
+-----------------------------------------------------------------------------------+
|                           3. DATA & PERSISTENCE LAYER                             |
|                                                                                   |
|                        +------------------------------+                           |
|                        |      Repository Service      |                           |
|                        +------------------------------+                           |
|                                  |          |                                     |
|                   +--------------+          +--------------+                      |
|                   v                                        v                      |
|   +------------------------------+        +-----------------------------------+   |
|   |  Local Cache (Hive / Prefs)  |        |  Cloud Backend (Firebase/Supabase)|   |
|   |  - Cached channel list       |        |  - Auth & Token verification      |   |
|   |  - Offline message storage   |        |  - Realtime WebSocket streams     |   |
|   +------------------------------+        +-----------------------------------+   |
+-----------------------------------------------------------------------------------+
```

### Layer Breakdown

1. **Presentation Layer**: Handles user interaction and responsive layouts. Automatically selects between a side-by-side split screen (Desktop/Web) and a drawer overlay (Mobile).
2. **Business Logic & State Layer**: Coordinates authentication, topic stream operations, message queuing, and state transitions without tight coupling to the UI.
3. **Data & Persistence Layer**: Abstract repository patterns that orchestrate between immediate local cache (Hive) and cloud database streaming (Supabase/Firebase).

---

## 📁 Project Structure

```text
lib/
├── core/
│   ├── constants/          # Theme constants, routes, asset paths
│   ├── network/            # WebSocket clients, HTTP helpers
│   ├── theme/              # Material 3 color palettes & typography
│   └── utils/              # Formatters, responsive breakpoints
│
├── features/
│   ├── auth/               # Login, invite pairing, token management
│   │   ├── data/           # Auth repositories & data sources
│   │   ├── domain/         # Auth models & use cases
│   │   └── presentation/   # Login & onboarding screens
│   │
│   ├── channels/           # Topic management & channel listing
│   │   ├── data/           # Channel repositories (Hive / Remote)
│   │   ├── domain/         # Channel entities & use cases
│   │   └── presentation/   # Channel drawer, sidebar, and channel creation modal
│   │
│   └── chat/               # Message timeline & composition
│       ├── data/           # Message sync & local caching
│       ├── domain/         # Message entities & badge models
│       └── presentation/   # Chat pane, message bubbles, badge attachments
│
└── main.dart               # App entrypoint & dependency injection setup
```

---

## 🚀 Getting Started

### Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (`>= 3.0.0`)
- [Dart SDK](https://dart.dev/get-dart) (`>= 3.0.0`)
- Android Studio / Xcode / VS Code with Flutter extensions
- A Firebase project or Supabase project configured

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/roopadeva48-tech/connect.git
   cd connect
   ```

2. **Install dependencies**:
   ```bash
   flutter pub get
   ```

3. **Configure Environment Variables / Backend**:
   - For **Firebase**: Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).
   - For **Supabase**: Set up your project URL and Anon key in `lib/core/constants/api_constants.dart` or via `.env`.

4. **Run code generators** (if using build_runner / Hive / Riverpod):
   ```bash
   dart run build_runner build --delete-conflicting-outputs
   ```

5. **Launch the application**:
   ```bash
   # For Mobile
   flutter run

   # For Chrome / Web
   flutter run -d chrome

   # For Desktop (Windows)
   flutter run -d windows
   ```

---

## 🗺️ Roadmap

- [x] Initial Architecture & Specification
- [ ] Authentication & Duo Pairing Workflow (Invite code / QR handshake)
- [ ] Dynamic Topic Workspace creation & Pinning support
- [ ] Real-time messaging with WebSocket listeners
- [ ] Offline caching engine with Hive
- [ ] Contextual badges (Expense summary, Quick Tasks, Reminders)
- [ ] Adaptive dual-pane desktop & collapsible mobile drawer

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
