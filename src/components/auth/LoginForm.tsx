import {type FC, useState, useEffect} from "react";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {PulseLoader} from "react-spinners";
import {UserIcon, LockClosedIcon} from "@heroicons/react/24/outline";
import {CustomButton} from "../../ui/CustomButton.tsx";
import {login} from "../../api/endpoints/auth.ts";
import {clearAccessToken} from "../../api/utils/tokenUtils.ts";
import {CustomInput} from "../../ui/CustomInput.tsx";
import {useNavigate} from "react-router-dom";

const schema = yup.object().shape({
    username: yup.string().required("Имя пользователя обязательно"),
    password: yup.string().min(6, "Минимум 6 символов").required("Пароль обязателен"),
});

type FormData = yup.InferType<typeof schema>;

export const LoginForm: FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: {errors}
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        clearAccessToken();
    }, []);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);
        try {
            await login(data);
            navigate("/directions");
        } catch (err: unknown) {
            console.error("Ошибка входа:", err);
            const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Ошибка входа. Проверьте логин и пароль.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <Controller
                        name="username"
                        control={control}
                        render={({field}) => (
                            <div>
                                <CustomInput
                                    {...field}
                                    icon={<UserIcon className={`text-[#6B9AB0] ${errors.username ? "text-red-500" : ""}`}/>}
                                    type="text"
                                    placeholder="Введите имя пользователя"
                                    error={errors.username?.message}
                                />
                                {errors.username?.message && (
                                    <p className="text-red-500 text-sm mt-2 ml-2">{errors.username.message}</p>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="password"
                        control={control}
                        render={({field}) => (
                            <div>
                                <CustomInput
                                    {...field}
                                    icon={<LockClosedIcon
                                        className={`text-[#6B9AB0] ${errors.password ? "text-red-500" : ""}`}/>}
                                    type="password"
                                    placeholder="Введите пароль"
                                    error={errors.password?.message}
                                />
                                {errors.password?.message && (
                                    <p className="text-red-500 text-sm mt-2 ml-2">{errors.password.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className="pt-2">
                    {!loading ? (
                        <CustomButton type="submit" variant="submit" className="w-full">
                            Войти
                        </CustomButton>
                    ) : (
                        <CustomButton type="submit" disabled={true} variant="disabled" className="w-full">
                            <div className="flex items-center justify-center space-x-2">
                                <PulseLoader size={6} color="#ffffff"/>
                                <span>Входим...</span>
                            </div>
                        </CustomButton>
                    )}
                </div>
            </form>
        </div>
    );
};