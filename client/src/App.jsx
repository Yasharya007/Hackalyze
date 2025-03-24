import { Route, Routes } from "react-router-dom";
import SamplePage from "./pages/SamplePage.jsx";
<<<<<<< HEAD

import FrontPage from "./pages/FrontPage.jsx"
=======
>>>>>>> 2a271e072dcb03d58f73b463533aa14105743838
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterStudentPage from "./pages/RegisterStudentPage.jsx";
import RegisterTeacherPage from "./pages/RegisterTeacherPage.jsx";
import StudentHackathonPage from "./pages/StudentHackathonPage.jsx";
import AdminHackathonPage from "./pages/AdminHackathonPage.jsx";
import AdminHackathonForm from "./pages/AdminHackathonForm.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CreateHackathon from "./pages/CreateHackathon.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import TeacherHackathonPage from "./pages/TeacherHackathonPage.jsx";
function App() {
  

  return (
    <>
      <div id="origin" className="flex">
        <Routes>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/student/register" element={<RegisterStudentPage/>}/>
            <Route path="/teacher/register" element={<RegisterTeacherPage/>}/>
            {/* <Route path="/student/dashboard" element={<SamplePage/>}/> */}
            <Route path="/hackathon" element={<StudentHackathonPage/>}/>
            <Route path="/faq" element={<FAQPage/>}/>
            <Route path="/teacher/dashboard" element={<TeacherDashboard/>}/>
            <Route path="/admin/hackathon" element={<AdminHackathonPage/>}/>
            <Route path="/admin/hackathon/:id" element={<AdminHackathonPage/>}/>
            <Route path="/admin/create-hackathon" element={<CreateHackathon/>}/>
            <Route path="/admin/edit-hackathon/:id" element={<CreateHackathon/>}/>
            <Route path="/student/dashboard" element={<StudentDashboard/>}/>
            <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
<<<<<<< HEAD
            <Route path="/main" element={<FrontPage/>}/>
=======
            <Route path="/teacher/hackathon" element={<TeacherHackathonPage/>}/>
>>>>>>> 2a271e072dcb03d58f73b463533aa14105743838

        </Routes>
      </div>
    </>
  )
}

export default App
