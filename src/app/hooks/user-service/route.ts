// export async function registerUser(userName: string, email: string, password: string) {
//     try {
//         const response = await fetch("https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/user-service/register", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 usuario: userName,
//                 email: email,
//                 senha: password
//             })
//         });
    
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(`Error registering user: ${errorData.message}`);
//         }

//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error("Error during user registration:", error);
//         throw error;
//     }
// } 

// export async function login(usuario: string, senha: string) {
//     try {
//         const response = await fetch("https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/user-service/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 usuario: usuario,
//                 senha: senha
//             }),
//             credentials: 'include'
//         });
    
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(`Error registering user: ${errorData.error}`); // Correto
//         }

//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error("Error during user login:", error);
//         throw error;
//     }
// } 

// export async function authenticateUser() {
//     try {
//         const response = await fetch("https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/user-service/auth", {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: 'include'
//         })

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(`Error authenticating user: ${errorData.message}`);
//         } else {
//             const data = await response.json();
//             return data;
//         }

//     } catch (error) {
//         console.error("Error during user authentication:", error);
//         throw error;
//     }
// }

export {};