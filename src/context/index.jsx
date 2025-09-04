import { createContext } from "react";
import RegisterStepHook from "./hooks/registerStepHook";

const Context = createContext();

function ContextHooks({ children }) {

    const {
        firstName, setFirstName,
        lastName, setLastName,
        dob, setDob,
        email, setEmail,
        password, setPassword,
        confirmPassword, setconfirmPassword,
        cep, setCep,
        country, setCountry,
        state, setState,
        city, setCity,
        district, setDistrict,
        street, setStreet,
        number, setNumber,
        complement, setComplement
    } = RegisterStepHook()

    return (
        <Context.Provider
            value={{
                firstName, setFirstName,
                lastName, setLastName,
                dob, setDob,
                email, setEmail,
                password, setPassword,
                confirmPassword, setconfirmPassword,
                cep, setCep,
                country, setCountry,
                state, setState,
                city, setCity,
                district, setDistrict,
                street, setStreet,
                number, setNumber,
                complement, setComplement
            }}
        >
            {children}
        </Context.Provider>
    )
}

export { Context, ContextHooks }



