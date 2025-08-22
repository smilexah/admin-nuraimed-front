import type { FC } from "react";

export interface CustomButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    variant?: "default" | "submit" | "disabled" | "cancel";
    type?: "button" | "submit" | "reset";
}

export const CustomButton: FC<CustomButtonProps> = ({
                                                        type = "button",
                                                        onClick,
                                                        disabled = false,
                                                        className,
                                                        children,
                                                        variant = "default",
                                                    }) => {
    const buttonClass = () => {
        switch (variant) {
            case "submit":
                return `bg-[#006799] cursor-pointer text-white px-4 py-2 active:bg-[#004C71] rounded-md hover:bg-[#01557D] transition duration-200 ease-in-out`;
            case "disabled":
                return `bg-[#006799] text-white  px-4 py-2  rounded-md opacity-75 transition duration-200 ease-in-out`
            case "cancel":
                return `bg-[#c71c2a]  cursor-pointer text-black px-4 py-2 active:bg-[#004C71] rounded-md hover:bg-[#961520] transition duration-200 ease-in-out`
            default:
                return `bg-[#6B9AB0] cursor-pointer  text-white px-4 py-2 rounded-md hover:bg-[#5A8DA3] transition duration-200 ease-in-out`;
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${buttonClass()} ${className}`}
        >
            {children}
        </button>
    );
};