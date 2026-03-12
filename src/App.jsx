import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'
import Spinner from './components/ui/Spinner'

// Eager-loaded pages
import Welcome from './pages/Welcome'
import StudentInfo from './pages/StudentInfo'
import Assessment from './pages/Assessment'
import Processing from './pages/Processing'
import NotFound from './pages/NotFound'

// Lazy-loaded heavy pages
const Report = lazy(() => import('./pages/Report'))
const CareerFinder = lazy(() => import('./pages/CareerFinder'))
const CourseFinder = lazy(() => import('./pages/CourseFinder'))
const UniFinder = lazy(() => import('./pages/UniFinder'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Methodology = lazy(() => import('./pages/Methodology'))
const CareerBuilder = lazy(() => import('./pages/CareerBuilder'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Welcome />} />
            <Route path="/start" element={<StudentInfo />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/processing/:id" element={<Processing />} />
            <Route
              path="/report/:id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Report />
                </Suspense>
              }
            />
            <Route
              path="/careers"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CareerFinder />
                </Suspense>
              }
            />
            <Route
              path="/courses"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CourseFinder />
                </Suspense>
              }
            />
            <Route
              path="/universities"
              element={
                <Suspense fallback={<PageLoader />}>
                  <UniFinder />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="/methodology"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Methodology />
                </Suspense>
              }
            />
            <Route
              path="/career-builder/:assessment_id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CareerBuilder />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
