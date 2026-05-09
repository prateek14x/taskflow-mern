import React, { useEffect, useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import NotificationPanel from "./NotificationPanel";
import UserAvatar from "./UserAvatar";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { updateURL } from "../utils";

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  useEffect(() => {
    updateURL({ searchTerm, navigate, location });
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  return (
    <div className='flex justify-between items-center bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 px-4 py-3 2xl:py-4 sticky z-10 top-0 backdrop-blur-sm'>
      <div className='flex gap-4'>
        <div className=''>
          <button
            onClick={() => dispatch(setOpenSidebar(true))}
            className='text-2xl text-slate-600 dark:text-slate-300 block md:hidden'
          >
            ☰
          </button>
        </div>

        {location?.pathname !== "/dashboard" && (
          <form
            onSubmit={handleSubmit}
            className='w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-slate-100 dark:bg-slate-900'
          >
            <MdOutlineSearch className='text-slate-500 text-xl' />

            <input
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              type='text'
              placeholder='Search...'
              className='flex-1 outline-none bg-transparent placeholder:text-slate-500 text-slate-900 dark:text-slate-100'
            />
          </form>
        )}
      </div>

      <div className='flex gap-2 items-center'>
        <NotificationPanel />

        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
