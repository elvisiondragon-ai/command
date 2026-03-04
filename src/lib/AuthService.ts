export const AUTH_USER = "elvisiondragon@gmail.com";
const AUTH_PASS = "Ewekuda7";
const STORAGE_KEY = "el_auth_session";

export const AuthService = {
    login: (email: string, pass: string): boolean => {
        if (email === AUTH_USER && pass === AUTH_PASS) {
            localStorage.setItem(STORAGE_KEY, "authenticated");
            return true;
        }
        return false;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = "/login";
    },

    isAuthenticated: (): boolean => {
        return localStorage.getItem(STORAGE_KEY) === "authenticated";
    },

    getUser: () => {
        return AUTH_USER;
    }
};
