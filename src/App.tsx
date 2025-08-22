import {Navigate, Route, Routes} from "react-router-dom";
import {PrimeReactProvider} from "primereact/api";
import {RequireAuth} from "./layouts/RequireAuth.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {ReviewsPage} from "./pages/ReviewsPage.tsx";
import {DirectionsPage} from "./pages/DirectionsPage.tsx";
import {DoctorsPage} from "./pages/DoctorsPage.tsx";

function App() {
    return (
        <PrimeReactProvider>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>

                <Route
                    path="/"
                    element={
                        <RequireAuth />
                    }
                >
                    <Route index element={<Navigate to={"/directions"} replace/>}/>

                    <Route path="directions" element={<DirectionsPage/>}/>
                    <Route path="doctors" element={<DoctorsPage/>}/>
                    <Route path="reviews" element={<ReviewsPage/>}/>
                </Route>

                <Route path="*" element={<Navigate to={"/directions"} replace/>}/>
            </Routes>
        </PrimeReactProvider>
    )
}

export default App;