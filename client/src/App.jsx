import { Transition } from "@headlessui/react";
import {
  Fragment,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoMdClose, IoMdMoon, IoMdSunny } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar, Sidebar } from "./components";
import { setOpenSidebar } from "./redux/slices/authSlice";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const TaskDetail = lazy(() => import("./pages/TaskDetail"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Trash = lazy(() => import("./pages/Trash"));
const Users = lazy(() => import("./pages/Users"));

function Layout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  return user ? (
    <div className='w-full h-screen flex flex-col md:flex-row'>
      <div className='w-1/5 h-screen bg-white dark:bg-[#1f1f1f] sticky top-0 hidden md:block'>
        <Sidebar />
      </div>

      <MobileSidebar />

      <div className='flex-1 overflow-y-auto'>
        <Navbar />

        <div className='p-4 2xl:px-10'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <Navigate to='/log-in' state={{ from: location }} replace />
  );
}

const MobileSidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.auth);
  const mobileMenuRef = useRef(null);
  const dispatch = useDispatch();

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen]);

  return (
    <Transition
      show={isSidebarOpen}
      as={Fragment}
      enter='transition-opacity duration-500'
      enterFrom='opacity-0'
      enterTo='opacity-100'
      leave='transition-opacity duration-500'
      leaveFrom='opacity-100'
      leaveTo='opacity-0'
    >
      {(ref) => (
        <div
          ref={(node) => (mobileMenuRef.current = node)}
          className={`md:hidden fixed inset-0 bg-black/40 transition-transform duration-500 z-40
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={closeSidebar}
        >
          <div
            className='bg-white dark:bg-[#121212] w-3/4 h-full shadow-xl'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='w-full flex justify-end px-5 pt-5'>
              <button
                onClick={closeSidebar}
                className='flex justify-end items-end text-slate-700 dark:text-slate-200'
                aria-label='Close menu'
              >
                <IoMdClose size={25} />
              </button>
            </div>

            <div className='-mt-10'>
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

const NotFound = () => (
  <div className='min-h-[70vh] flex flex-col items-center justify-center text-slate-700 dark:text-slate-200 px-4'>
    <h1 className='text-5xl font-semibold mb-4'>404</h1>
    <p className='text-lg mb-6'>Page not found. The route you followed does not exist.</p>
    <Link
      to='/dashboard'
      className='px-5 py-3 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 transition'
    >
      Go to Dashboard
    </Link>
  </div>
);

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    type='button'
    onClick={toggleTheme}
    className='fixed right-4 bottom-24 z-50 inline-flex items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 p-3 shadow-xl border border-slate-700 dark:border-slate-300 transition-all hover:bg-slate-800 dark:hover:bg-slate-200'
    aria-label='Toggle theme'
  >
    {theme === "dark" ? <IoMdSunny size={20} /> : <IoMdMoon size={20} />}
  </button>
);

const App = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("taskflow-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("taskflow-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <main className={theme === "dark" ? "dark" : ""}>
      <div className='w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center min-h-screen'>
              <span className='text-slate-800 dark:text-slate-200'>Loading app...</span>
            </div>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Navigate to='/dashboard' replace />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/tasks' element={<Tasks />} />
              <Route path='/completed/:status?' element={<Tasks />} />
              <Route path='/in-progress/:status?' element={<Tasks />} />
              <Route path='/todo/:status?' element={<Tasks />} />
              <Route path='/trashed' element={<Trash />} />
              <Route path='/task/:id' element={<TaskDetail />} />
              <Route path='/team' element={<Users />} />
              <Route path='*' element={<NotFound />} />
            </Route>

            <Route path='/log-in' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        </Suspense>
      </div>

      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <Toaster richColors position='top-center' />
    </main>
  );
};

export default App;
