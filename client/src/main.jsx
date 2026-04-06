import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

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
      { path: 'dashboard', element: <Suspense fallback={<PageFallback />}><Dashboard /></Suspense> },
      { path: 'mytasks', element: <Suspense fallback={<PageFallback />}><MyTasks /></Suspense> },
      { path: 'viewtask/:id', element: <Suspense fallback={<PageFallback />}><ViewTasks /></Suspense> },
      { path: 'viewteamtask/:id', element: <Suspense fallback={<PageFallback />}><ViewTeamTasks /></Suspense> },
      { path: 'addtasks', element: <Suspense fallback={<PageFallback />}><AddTasks /></Suspense> },
      { path: 'edit', element: <Suspense fallback={<PageFallback />}><Edit /></Suspense> },
      { path: 'collaborate', element: <Suspense fallback={<PageFallback />}><Collaborate /></Suspense> },
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
