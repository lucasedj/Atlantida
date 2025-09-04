import React, { useState } from "react";

export default function RegisterStepHook() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [dob, setDob] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setconfirmPassword] = useState("")
    // REGISTROS SEGUNDA TELA
    const [cep, setCep] = useState("")
    const [country, setCountry] = useState("")
    const [state, setState] = useState("")
    const [city, setCity] = useState("")
    const [district, setDistrict] = useState("")
    const [street, setStreet] = useState("") 
    const [number, setNumber] = useState("")
    const [complement, setComplement] = useState("")
      

    return {
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
    }
}