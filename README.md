

# AlphaNext - Ready for the next level

A web-based application for online practice questions and tryout exams.  
This project is built to support admin and user roles with a modern, responsive interface.

---

## 📌 Project Overview

This application provides:
- Online practice questions and tryout exams
- Admin dashboard for content management
- User dashboard for practice, tryout, and ranking
- Scalable frontend architecture ready for backend integration

⚠️ **Note:**  
This repository contains the **frontend only**. Backend services are handled separately.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand / React Context
- **API Handling:** Fetch API / Axios
- **Theme Color:** Green
- **Responsive:** Desktop & Mobile

---

## 👥 User Roles

### 1. Admin
- Manage users
- Manage questions
- Manage packages & vouchers
- Manage materials (ebook & video)
- Manage tryout & mass tryout
- View rankings

### 2. User
- Access purchased packages
- Practice questions
- Join tryout & mass tryout
- View learning materials
- View history & rankings

---

## 📄 Main Features

### Landing Page
- Hero section with CTA
- Features overview
- Pricing / packages
- Login & Register navigation

### Authentication
- Login & Register pages
- Mock authentication (frontend only)
- User state stored globally

### Admin Dashboard
- Sidebar & top navigation
- CRUD operations using tables & modals
- Dashboard overview & analytics (dummy data)

### User Dashboard
- Practice & tryout system
- Timer & navigation
- Weighted scoring system
- Ranking & history

---

## 🔁 Practice & Tryout System

- Question navigation (next / previous)
- Answered & unanswered indicators
- Countdown timer
- Multiple-choice questions
- Each option has different score weight
- Dummy score calculation

## 📁 Project Structure

app/
├─ api/
├─ (auth)/
├─ admin/
├─ user/
├─ layout.tsx
└─ page.tsx

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
yarn install
````

### 2. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open `http://localhost:3000` in your browser.



## ⚠️ Important Notes

* This project uses **dummy data only**
* No real authentication or payment integration
* Ready to be connected with real backend APIs
* Designed for demo and client presentation

---

## 📄 License

This project is developed for client use.
All rights reserved unless stated otherwise.

