![Screenshot 2025-03-25 202102](https://github.com/user-attachments/assets/e1807701-693c-4137-be81-ab146a1c1ce6)
# Hackalyze - Code To Give 2025

## 🚀 Project Overview
Hackalyze is designed to streamline the **hackathon management** process, making it easier for organizers, participants, and judges to collaborate efficiently.

## Problem Statement
Evaluating student ideas at scale is challenging, especially when submissions are **unstructured and lack clarity**. 
Teachers also struggle with conducting **personalized assessments** in classrooms, making it difficult to gauge student understanding and provide targeted feedback.

## 📌 Features  

```mermaid
graph TD;
    A[Hackathon Creation & Management] --> B[Team Registration & Collaboration]
    B --> C[Project Submission & Evaluation]
    C --> D[Leaderboard & Performance Analytics]
    D --> E[Mentorship & Support Integration]
    E --> F[Automated Judging & Results Calculation]
    F -->|Final Results| G[Winners & Recognition]
    
    subgraph AI  Integration
      E --> AI[AI Chatbot & Mentor Support]
      F --> ML[AI-Driven Evaluation]
      C --> S3[Cloud Storage for Projects]
      D --> DB[Leaderboard Data Storage]
    end
```

- **Hackathon Creation & Management**
- **Team Registration & Collaboration**
- **Project Submission & Evaluation**
- **Leaderboard & Performance Analytics**
- **Mentorship & Support Integration**
- **Automated Judging & Results Calculation**


## 🛠 Tech Stack & AI Integration
The project leverages a modern tech stack along with AI capabilities for seamless performance and intelligent automation.

### **Frontend:**
- **React.js** – For building an interactive UI
- **Tailwind CSS** – For rapid and responsive styling

### **Backend:**
- **Node.js & Express.js** – Server-side logic for handling requests
- **MongoDB** – NoSQL database for efficient data storage

### **AI & OCR Integration:**
- **Google Gemini** – AI-driven assistance for various tasks
- **Tesseract OCR (Python)** – Optical character recognition for text extraction

### **Design & Media:**
- **Canva and Figma** – For designing UI elements and media assets

### **Development Workflow:**
- **MERN Stack** – Full-stack development with MongoDB, Express.js, React.js, and Node.js

---

## 🔄 Workflow & Architecture
Hackalyze follows a **microservices-based modular architecture**:

1. **User Authentication** – Secure login and registration
2. **Hackathon Setup** – Organizers create and configure events
3. **Team Formation & Project Submission** – Participants collaborate and submit projects
4. **Judging & Evaluation** – Judges assess projects based on predefined criteria
5. **Leaderboard & Insights** – Real-time leaderboard updates

### 📌 **Flowchart Representation**
```mermaid
graph TD;
    A[User Registration/Login] -->|JWT Authentication| B[Dashboard];
    B --> C[Teacher Side];
    C --> K[Create Hackathon];
    B --> D[Student Side];
    D --> L[Join Hackathon];
    D --> E[Submit Project];
    E --> F[Evaluation by Judges];
    F --> G[Leaderboard Generation];
    G --> H[Final Results & Awards];
```

---

## 🛠 Installation & Setup
Follow these steps to set up Hackalyze locally:

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo/Hackalyze.git
cd Hackalyze
```

### **2️⃣ Install Dependencies**
```sh
npm install  # Install dependencies for frontend & backend
```

### **3️⃣ Set Up Environment Variables**
Create a `.env` file in the backend directory:
```sh
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

### **4️⃣ Start Development Server**
```sh
npm run dev
```

---

## 🎥 Demo & Screenshots
![WhatsApp Image 2025-03-27 at 1 01 08 AM](https://github.com/user-attachments/assets/7ce67475-56c8-4d39-9956-14423753d343)

---

## 🎯 Future Enhancements

- 🤖 **AI Evaluation** – Automated project assessment  
- 🔗 **Blockchain Voting** – Secure and transparent voting system  
- 💬 **Real-time Chat & Video** – Seamless mentoring and collaboration  
- 🎓 **AI Student Assistance** – Smart guidance for participants  
- 📧 **Enhanced Email Support** – Faster and structured responses  
- 📱 **Mobile Optimization** – Improved accessibility on all devices  
- 📝 **AI Feedback Analysis** – Intelligent insights for better learning  
- 📂 **Advanced File Management** – Efficient sharing and organization  
- 🔊 **Auto Problem Statement Summary** – AI-driven summarization & reading  

---

## 🤝 Contributors
- Yash Arya
- Vaishnavi Tiwari
-  Samudraneel Sarkar
-  Akriti Gaur
-  Trishita Kesarwani
-  Kratika Bhadauria

---


