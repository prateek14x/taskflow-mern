const BASE_URL = import.meta.env.VITE_API_URL;

const USERS_URL = `${BASE_URL}/api/user`;

const TASKS_URL = `${BASE_URL}/api/task`;

const ADMIN_URL = `${BASE_URL}/api/admin`;

export { BASE_URL, USERS_URL, TASKS_URL, ADMIN_URL };