

#  Trinetra – AI Crowd Safety System

### *Real-Time Crowd Risk Detection Using Vision + ML*

> **Tech Stack:** Python • XGBoost • ResNet • React Native • Node.js • MongoDB • REST APIs

---

## 🚨 Overview

**Trinetra** is an **AI-driven crowd safety and monitoring system** that predicts next day foot fall of temple and prevents crowd-related hazards like stampedes in real-time.
It combines **computer vision**, **machine learning**, and **IoT data analytics** to detect abnormal density patterns and alert authorities before critical situations occur.

The system consists of:

* An **AI-powered backend** for video-based crowd risk assessment
* A **mobile app** (React Native) for field responders
* An **admin dashboard** for live surveillance, analytics, and alert control

---
### 📱 Mobile App Screenshots

|                                       🏠 Home Page                                       |                                       📊 Queue Page                                       |                                       🔮 Crowd Prediction                                      |
| :--------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------: |
| ![Home](https://github.com/user-attachments/assets/8333391f-5bd4-48ea-a3ac-c9a5a72c0a6d) | ![Queue](https://github.com/user-attachments/assets/68ccb399-e197-4e78-897e-a6cf54aa77ca) | ![Prediction](https://github.com/user-attachments/assets/bbe34f96-a53c-485b-ac67-8481fab25ab6) |

> The Trinetra mobile app (built with **React Native**) enables on-ground officers to monitor **live crowd flow**, **queue lengths**, and **next-day footfall predictions** through a simple, intuitive UI.

### Temple Dashboard
 <img width="1920" height="928" alt="image" src="https://github.com/user-attachments/assets/8778e835-f1ef-4899-954f-61124b5c994e" />

## ⚙️ Key Features

* 🎥 **Computer Vision–Based Detection:**

  * Uses **ResNet-50** to analyze CCTV or drone footage
  * Detects and counts individuals, computes motion and density metrics (85%+ detection accuracy)

* 📊 **Predictive ML Pipeline:**

  * **XGBoost-based risk model** trained on 80+ engineered features (motion vectors, crowd density, color entropy, etc.)
  * Predicts crowd safety risk levels: *Low / Moderate / High* with ~75% accuracy

* ⚡ **Real-Time Processing & Alerts:**

  * Streams live crowd data via WebSocket
  * Auto-triggers alert notifications to the mobile app and dashboard when high risk is detected

* 📱 **Mobile App (React Native):**

  * Field officer interface to view camera streams, alert history, and risk levels
  * Works seamlessly in low-bandwidth conditions
  * Appwrite Authentication 

* 🖥️ **Admin Dashboard:**

  * Central command interface for monitoring multiple sites
  * Visual heatmaps, alert analytics, and response tracking

* 🔒 **Secure APIs & Role-Based Access:**

  * Built with **Node.js + Express**
  * Integration-ready for auth services or cloud databases

---

## 🧩 System Architecture

```
         ┌──────────────────────────────┐
         │  Admin Dashboard (React)      │
         │  Risk Analytics + Live Feeds  │
         └──────────────▲───────────────┘
                        │
                        │ REST + WebSocket
                        │
┌──────────────────────────────┐       ┌──────────────────────────────┐
│  Mobile App (React Native)   │──────▶│  Node.js Backend (API Layer) │
│  Alerts + Live Risk Display  │       │  Auth + Data + Alerts        │
└──────────────────────────────┘       └──────────────▲───────────────┘
                                                     │
                                                     │
                                          ┌────────────────────────┐
                                          │   ML Service (Python)  │
                                          │ ResNet + XGBoost Model │
                                          └───────────▲────────────┘
                                                      │
                                                      ▼
                                          ┌────────────────────────┐
                                          │   MongoDB / Cloud DB   │
                                          │   Video & Alert Logs   │
                                          └────────────────────────┘
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mukulpythondev/trinetra.git
cd trinetra
```

### 2️⃣ Backend Setup

```bash
cd services/backend
npm install
npm run dev
```

### 3️⃣ ML Service Setup

```bash
cd services/ai_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 4️⃣ Frontend (React Native App)

```bash
cd mobile
npm install
npx expo start
```

---

## 🧠 Machine Learning Details

| Component              | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Model**              | XGBoost Classifier                                                              |
| **Features**           | 80+ custom-engineered metrics (crowd density, frame variance, movement entropy) |
| **Accuracy**           | ~75% overall crowd risk prediction                                              |
| **Vision Model**       | ResNet-50 (transfer learning)                                                   |
| **Detection Accuracy** | ~85% person detection in real-time feeds                                        |

---

## 📈 Results

| Metric                        | Value    |
| ----------------------------- | -------- |
| **Vision Detection Accuracy** | 85%      |
| **ML Prediction Accuracy**    | 75%      |
| **Latency (per frame)**       | ~120 ms  |
| **Alert Delay**               | <1.5 sec |

---

## 🧪 Example Use Cases

* Large public gatherings (festivals, rallies, concerts)
* Stadiums or event management systems
* Smart city surveillance integration
* Crowd control during emergencies

---


## 💡 Future Improvements

* Integration with **IoT sensors** (temperature, sound, CO₂ levels) for hybrid risk scoring.
* Deploy ML pipeline to **edge devices (Jetson Nano / Raspberry Pi)** for real-time inference.
* Add **geofencing and alert routing** to emergency teams.

---


