// import React, {type FC, useState} from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import logoImage from '../assets/logo.png';
// import {login} from "../api/endpoints/auth.ts";
//
// export const Login: FC = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//
//   const navigate = useNavigate();
//   const location = useLocation();
//
//   const from = location.state?.from?.pathname || '/directions';
//
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//
//     try {
//       const response = await login({ username, password });
//
//       if (!response.accessToken || !response.refreshToken) {
//         console.error('Токены отсутствуют в ответе сервера:', response);
//         setError('Ошибка сервера: токены не получены');
//         return;
//       }
//
//       console.log('Сохраняем токены в localStorage');
//       localStorage.setItem('accessToken', response.accessToken);
//       localStorage.setItem('refreshToken', response.refreshToken);
//
//       const savedAccessToken = localStorage.getItem('accessToken');
//       const savedRefreshToken = localStorage.getItem('refreshToken');
//       console.log('Сохраненные токены:', {
//         accessToken: savedAccessToken,
//         refreshToken: savedRefreshToken
//       });
//
//
//       navigate(from, { replace: true });
//     } catch (err: any) {
//       console.error('Ошибка при входе:', err);
//
//       if (err.response) {
//         console.error('Ответ сервера с ошибкой:', err.response.data);
//         console.error('Статус ошибки:', err.response.status);
//         setError(`Ошибка сервера: ${err.response.status} - ${err.response.data?.message || 'Неизвестная ошибка'}`);
//       } else if (err.request) {
//         console.error('Сервер не отвечает:', err.request);
//         setError('Сервер недоступен. Проверьте, что backend запущен на localhost:8080');
//       } else {
//         console.error('Неизвестная ошибка:', err.message);
//         setError(`Ошибка: ${err.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <div className="mx-auto h-20 w-35 mb-6 flex items-center justify-center">
//             <img
//               src={logoImage}
//               alt="Nuraimed Logo"
//               className="h-full w-full object-contain drop-shadow-lg"
//             />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">
//             Добро пожаловать
//           </h2>
//           <p className="text-gray-600 text-sm">
//             Войдите в админ панель Nuraimed
//           </p>
//         </div>
//
//         <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                   Логин
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                   </div>
//                   <input
//                     id="username"
//                     name="username"
//                     type="text"
//                     required
//                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
//                     placeholder="Введите логин"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                   />
//                 </div>
//               </div>
//
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                   Пароль
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                     </svg>
//                   </div>
//                   <input
//                     id="password"
//                     name="password"
//                     type="password"
//                     required
//                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
//                     placeholder="Введите пароль"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>
//
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                 <div className="flex items-center">
//                   <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span className="text-red-700 text-sm font-medium">{error}</span>
//                 </div>
//               </div>
//             )}
//
//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg"
//               >
//                 {loading && (
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 )}
//                 {loading ? 'Входим...' : 'Войти в систему'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };
