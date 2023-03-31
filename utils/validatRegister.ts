import { UsernamePasswordInput } from "../src/resolvers/UsernamePasswordInput";



export const validateRegister = (args: UsernamePasswordInput) => {
         
    if(!args.email.includes('@')){
        return [
            {
                field : "email",
                message : "Please enter valid email"
            },
        ]
    }



    if(args.username.length <= 2){
        return [
            {
                field : "username",
                message : "Length of username must be greater than 2"
            },
        ]
    }

    if(args.username.includes('@')){
        return [
                {
                    field : "username",
                    message : "Username cannot contain @"
                },
        ]
    }


    if(args.password.length <= 3 ){
        return [
                {
                    field : "password",
                    message : "Pasword length must be greater than 3"
                },
        ]
    }
    
   return null;

}