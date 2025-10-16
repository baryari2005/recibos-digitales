import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Evita la redirección automática a /login en 401 (interceptor) */
    skipAuthRedirect?: boolean;
  }
}
