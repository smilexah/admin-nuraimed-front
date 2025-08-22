import type {FC, ReactNode} from "react";

export const Container:FC<{children:ReactNode, className?:string}> = ({children, className}) => {
    return (
        <div className={`max-w-[1000px] mx-auto px-4 py-8 ${className}`}>
            {children}
        </div>
    )
}