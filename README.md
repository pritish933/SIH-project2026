# InstaCure - Smart Telehealth & Rural Care Network
> **Smart India Hackathon (SIH) 2026**  
> *Bridging the Healthcare Divide: Bringing Specialized Medical Care & Emergency Coordination to India's Last Mile.*

---

## 📌 Problem Statement
In rural and remote regions of India, access to quality healthcare remains a severe bottleneck:
- **Doctor-to-Patient Ratio**: Primary health sub-centers and villages face acute shortages of MBBS and specialist doctors.
- **Geographical & Travel Barriers**: Patients often travel 40–80 km to district headquarters for routine checkups or basic diagnostic interpretations.
- **ASHA Worker Workload**: Frontline community health workers track maternal health and chronic diseases using physical paper registers, delaying critical early interventions.
- **Emergency Bottlenecks**: During medical emergencies (cardiac, maternal, trauma), families lose critical "golden hours" wandering between hospitals searching for available ICU beds and oxygen.

---

## 💡 Our Solution: InstaCure
**InstaCure** is an integrated, low-bandwidth optimized rural digital health platform designed with a role-based architecture for:
1. **Patients / Citizens**: Teleconsultations, emergency desk, nearby hospital beds tracker, diagnostic scanner, and personal health records.
2. **Doctors / Specialists**: Clinical consultation room, digital E-prescriptions, daily OPD schedule, and high-risk patient follow-up management.
3. **ASHA Frontline Workers**: Field screening survey toolkit, community vitals monitor, vaccination alerts, and maternal health tracking.
4. **Hospital Reception & Emergency Desk**: Real-time triage, incoming ambulance tracking, ICU bed reservation, and trauma alert coordination.
5. **District Administrators**: Public health analytics, disease outbreak heatmaps, medicine stock monitoring, and doctor availability tracking.

---

## 🌟 Key Features

### 1. Low-Bandwidth Assisted Teleconsultation
- Audio/Video consultation optimized for 2G/3G/4G rural connectivity.
- In-call clinical note-taking and instant digital E-Prescription generation.
- Dialect and regional language symptom assistance.

### 2. Smart AI Diagnostic Lab Report Scanner
- Analyzes uploaded paper pathology reports or doctor prescription notes.
- Extracts vitals (Blood Sugar, Blood Pressure, Hemoglobin, Creatinine, Lipid profiles).
- Flags critical borderline values and automatically attaches structured metrics into patient EHR.

### 3. Real-Time Hospital Bed & Facility Recommendation Engine
- Live mapping of District Hospitals, Sub-Divisional Hospitals, and Community Health Centers (CHCs).
- Distance calculation, travel time estimates, and emergency phone hotlines.
- Real-time tracker for General Beds, ICU Beds, Ventilators, and Oxygen availability.

### 4. Emergency & Ambulance Coordination Desk
- One-touch SOS dispatch workflow.
- Live triage categorization (Critical Red, Urgent Yellow, Stable Green).
- ETA countdown timer and hospital trauma team pre-arrival briefing.

### 5. ASHA Community Field Portal
- Household survey and patient registration.
- NCD (Non-Communicable Disease) screening and high-risk pregnancy monitoring.
- Medicine distribution and field inventory logs.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Motion |
| **Icons & UI** | Lucide React |
| **Build Tool** | Vite 6 |
| **Backend & API** | Node.js, Express, Vercel Serverless Functions |
| **AI Diagnostics** | Google Gemini API (with deterministic clinical fallback engine) |
| **Deployment** | Vercel (Edge Network & Serverless) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pritish933/SIH-project2026.git
   cd SIH-project2026
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```
   *(Note: The platform features a built-in clinical fallback parser, so it runs completely out-of-the-box even without an API key).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 📦 Production Build

To build the frontend bundle for production:
```bash
npm run build
```

---

## 🌐 Live Deployment
The project is hosted and continuously deployed via Vercel.  
Production URL: Available in the repository deployments tab.

---

## 🎯 Smart India Hackathon Alignment
- **Theme**: Healthcare & Biomedical Technology / Rural Development
- **Target Beneficiaries**: Rural citizens, ASHA workers, Primary Health Centers (PHCs), District Hospitals
- **Scalability**: Designed to integrate with National Digital Health Mission (NDHM / ABDM) and Ayushman Bharat Health Account (ABHA) standards.
