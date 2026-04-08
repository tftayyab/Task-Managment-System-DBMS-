import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
}
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('darkMode');
}

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyTasks = lazy(() => import('./pages/MyTasks'));
const ViewTasks = lazy(() => import('./pages/ViewTasks'));
const ViewTeamTasks = lazy(() => import('./pages/ViewTeamTasks'));
const AddTasks = lazy(() => import('./pages/AddTasks'));
const Edit = lazy(() => import('./pages/EditTasks'));
const Collaborate = lazy(() => import('./pages/Collaborate'));

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '', element: <Suspense fallback={<PageFallback />}><Home /></Suspense> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Suspense fallback={<PageFallback />}><Dashboard /></Suspense></ProtectedRoute>,
      },
      {
        path: 'mytasks',
        element: <ProtectedRoute><Suspense fallback={<PageFallback />}><MyTasks /></Suspense></ProtectedRoute>,
      },
      {
        path: 'viewtask/:id',
        element: <ProtectedRoute><Suspense fallback={<PageFallback />}><ViewTasks /></Suspense></ProtectedRoute>,
      },
      {
        path: 'viewteamtask/:id',
        element: <ProtectedRoute><Suspense fallback={<PageFallback />}><ViewTeamTasks /></Suspense></ProtectedRoute>,
      },
      {
        path: 'addtasks',
        element: <ProtectedRoute><Suspense fallback={<PageFallback />}><AddTasks /></Suspense></ProtectedRoute>,
      },
      {
        path: 'edit',
        element: <ProtectedRoute><Suspense fallback={<PageFallback />}><Edit /></Suspense></ProtectedRoute>,
      },
      {
        path: 'collaborate',
        element: <ProtectedRoute><Suspense fallback={<PageFallback />}><Collaborate /></Suspense></ProtectedRoute>,
      },
    ],
  },
  { path: '/login', element: <Suspense fallback={<PageFallback />}><Login /></Suspense> },
  { path: '/register', element: <Suspense fallback={<PageFallback />}><Register /></Suspense> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
