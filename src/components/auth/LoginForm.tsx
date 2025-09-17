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
        } catch (err: any) {
            console.error("Ошибка входа:", err);
            const errorMessage = err?.response?.data?.message || "Ошибка входа. Проверьте логин и пароль.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[20px]">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <Controller
                name="username"
                control={control}
                render={({field}) => (
                    <>
                        <CustomInput
                            {...field}
                            icon={<UserIcon className={`text-[#6B9AB0] ${errors.username ? "text-red-500" : ""}`}/>}
                            type="text"
                            placeholder="Введите имя пользователя"
                            error={errors.username?.message}
                        />
                        {errors.username?.message && (
                            <p className="text-red-500 text-sm mt-[-15px] ml-2">{errors.username.message}</p>
                        )}
                    </>
                )}
            />

            <Controller
                name="password"
                control={control}
                render={({field}) => (
                    <>
                        <CustomInput
                            {...field}
                            icon={<LockClosedIcon
                                className={`text-[#6B9AB0] ${errors.password ? "text-red-500" : ""}`}/>}
                            type="password"
                            placeholder="Введите пароль"
                            error={errors.password?.message}
                        />
                        {errors.password?.message && (
                            <p className="text-red-500 text-sm mt-[-15px] ml-2">{errors.password.message}</p>
                        )}
                    </>
                )}
            />

            {!loading ? (
                <CustomButton type="submit" variant="submit">Войти</CustomButton>
            ) : (
                <CustomButton type="submit" disabled={true} variant="disabled">
                    <PulseLoader size={6} color="#ffffff"/>
                </CustomButton>
            )}
        </form>
    );
};