import { Route, Routes } from "react-router-dom";
import SamplePage from "./pages/SamplePage.jsx";
import FrontPage from "./pages/FrontPage.jsx"
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
import StudentDetails from "./pages/IndividualSubmission.jsx";
import DetailedAnalysis from "./pages/DetailedAnalysis.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import EnrolledHackathons from "./pages/EnrolledHackathons.jsx";
import StudentSettings from "./pages/StudentSettings.jsx";

function App() {
  

  return (
    <>
      <div id="origin" className="flex">
        <Routes>
            <Route path="/" element={<FrontPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/student/register" element={<RegisterStudentPage/>}/>
            <Route path="/teacher/register" element={<RegisterTeacherPage/>}/>
            {/* <Route path="/student/dashboard" element={<SamplePage/>}/> */}
            <Route path="/student/hackathon/:id" element={<StudentHackathonPage/>}/>
            <Route path="/faq" element={<FAQPage/>}/>
            <Route path="/teacher/dashboard" element={<TeacherDashboard/>}/>
            <Route path="/admin/hackathon" element={<AdminHackathonPage/>}/>
            <Route path="/admin/hackathon/:id" element={<AdminHackathonPage/>}/>
            <Route path="/admin/create-hackathon" element={<CreateHackathon/>}/>
            <Route path="/admin/edit-hackathon/:id" element={<CreateHackathon/>}/>
            <Route path="/student/dashboard" element={<StudentDashboard/>}/>
            <Route path="/student/profile" element={<StudentProfile/>}/>
            <Route path="/student/enrolled-hackathons" element={<EnrolledHackathons/>}/>
            <Route path="/student/settings" element={<StudentSettings/>}/>
            <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
            <Route path="/main" element={<FrontPage/>}/>
            <Route path="/teacher/hackathon" element={<TeacherHackathonPage/>}/>
            <Route path="/teacher/individualSubmission" element={<StudentDetails/>}/>
            <Route path="/teacher/detailedAnalysis" element={<DetailedAnalysis/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
