import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/OtherPage/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import TestApi from "./pages/TestApi";
// import UsersFromDb from "./pages/UsersFromDb";

import ActivateAccount from "./pages/AuthPages/ActivateAccount";

import PendingUsersPage from "./pages/User/PendingUsersPage";
import UserManagementPage from "./pages/User/UserManagementPage";
import AccountSettings from "./pages/AuthPages/AccountSettings";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ProjectsListPage } from "./components/filrouge/projects/ProjectsListPage";
import { ProjectDetailPage } from "./components/filrouge/project/ProjectDetailPage";
import ResourcesPage from "./components/filrouge/resources/ResourcesPage";
import HomeworkReviewsPage from "./pages/HomeworkReviewsPage";
import HomeworkDetailsPage from "./pages/HomeworkDetailsPage";
import MySubmissionsPage from "./pages/MySubmissionsPage";
import ModuleDetailsPage from "./pages/ModuleDetailsPage";
import LearningPage from "./pages/LearningPage";
import FormateurQuizDashboard from "./pages/quizzes/formateur/FormateurQuizDashboard";
import AvailableQuizzesPage from "./pages/quizzes/bootcamper/AvailableQuizzesPage";
import CreateQuizPage from "./pages/quizzes/formateur/create/CreateQuizPage";
import TakeQuizPage from "./pages/quizzes/bootcamper/player/TakeQuizPage";
import MyQuizResults from "./pages/quizzes/bootcamper/MyQuizResults";
import FormateurQuizResultsPage from "./pages/quizzes/formateur/FormateurQuizResultsPage";
import EditQuizPage from "./pages/quizzes/formateur/EditQuizPage";
import QuizPreviewPage from "./pages/quizzes/formateur/QuizPreviewPage";
import NotificationsPage from "./pages/NotificationsPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        className="toast-container"

      />
      <Routes>
        {/* Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            <Route path="/admin/users/pending" element={<PendingUsersPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />

            {/* Fil Rouge Projects */}
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/resources" element={<ResourcesPage />} />

            {/* Homework Workflow */}
            <Route path="/homework-reviews" element={<HomeworkReviewsPage />} />
            <Route path="/homework/:resourceId/reviews" element={<HomeworkDetailsPage />} />
            <Route path="/my-submissions" element={<MySubmissionsPage />} />

            <Route path="/learning" element={<LearningPage />} />
            <Route path="/learning/:moduleId" element={<ModuleDetailsPage />} />

            {/* QUIZ MODULE */}
            <Route element={<ProtectedRoute allowedRoles={["FORMATEUR"]} />}>
              <Route path="/quizzes/formateur" element={<FormateurQuizDashboard />} />
              <Route path="/quizzes/create" element={<CreateQuizPage />} />
              <Route path="/quizzes/formateur/results" element={<FormateurQuizResultsPage />} />
              <Route path="/quizzes/:quizId/preview" element={<QuizPreviewPage />} />              
              <Route path="/quizzes/:quizId/edit" element={<EditQuizPage />} />

            </Route>

            <Route element={<ProtectedRoute allowedRoles={["BOOTCAMPER"]} />}>
              <Route path="/quizzes" element={<AvailableQuizzesPage />} />
              <Route path="/quizzes/my-results" element={<MyQuizResults />} />
              <Route path="/quizzes/:quizId/take" element={<TakeQuizPage />} />
            </Route>

            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/account-settings" element={<AccountSettings />} />
          </Route>
        </Route>

        {/* PUBLIC ROUTES */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
