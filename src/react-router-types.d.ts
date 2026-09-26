import type { ComponentType, ReactNode } from 'react';

export interface Path {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

export interface Location<S extends unknown = unknown> extends Path {
  state: S;
}

export interface Params {
  [key: string]: string | undefined;
}

export interface Navigation {
  location: Location;
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

export interface Router {
  state: {
    location: Location;
    navigation: Navigation | null;
    error: unknown;
  };
  subscribe: (fn: (state: { location: Location; navigation: Navigation | null; error: unknown }) => void) => () => void;
  navigate: (to: string | Partial<Path>) => void;
  fetch: (opts: { pathname?: string; search?: string }) => void;
  createHref: (to: string | Partial<Path>) => string;
  encodeLocation: (to: string | Partial<Path>) => Path;
  deleteOpts: { pathname?: string; search?: string };
  matches?: any;
  routeModules?: any;
  manifest?: any;
  _internalFetchControllers?: any;
  _internalSetRoutes?: any;
  initialize: () => void;
  _internalFetchControllers: Map<string, AbortController>;
  _internalSetRoutes: (routes: any[]) => void;
}

export interface RouteObject {
  id?: string;
  path?: string;
  caseSensitive?: boolean;
  index?: boolean;
  children?: RouteObject[];
  action?: any;
  loader?: any;
  errorElement?: ReactNode;
  element?: ReactNode;
  Component?: ComponentType;
  ErrorBoundary?: ComponentType;
  HydrateFallback?: ComponentType;
  handle?: any;
  shouldRevalidate?: any;
  lazy?: any;
  loaderData?: any;
  actionData?: any;
}

export function createBrowserRouter(routes: RouteObject[]): any;
export function createHashRouter(routes: RouteObject[]): any;
export function createMemoryRouter(routes: RouteObject[], opts?: { initialEntries?: string[] }): any;
export function createStaticRouter(routes: any[], manifest: any): any;
export function createRoutesFromChildren(children: ReactNode): RouteObject[];
export function createRoutesFromElements(elements: ReactNode): RouteObject[];
export function matchRoutes(routes: RouteObject[], location: string | Partial<Path>): any[];
export function generatePath(path: string, params?: Record<string, string | number>): string;
export function resolvePath(to: string | Partial<Path>, fromPath?: string): Path;

export function useLocation(): Location;
export function useNavigate(): (to: string | Partial<Path>, opts?: { replace?: boolean; state?: unknown }) => void;
export function useParams(): Params;
export function useMatch<S = unknown>(pattern: string | { path: string; caseSensitive?: boolean; end?: boolean }): { params: Params; pathname: string; pathnameBase: string; pattern: string } | null;
export function useNavigation(): { location: Location; formMethod?: string; formAction?: string; formEncType?: string; state: unknown; status: string; };
export function useNavigationType(): number;
export function useOutlet(): ReactNode;
export function useOutletContext<T = unknown>(): T;
export function useRoutes(routes: RouteObject[], location?: string | Partial<Path>): ReactNode;
export function useSearchParams(): [URLSearchParams, (search: string | URLSearchParams, navigateOpts?: { replace?: boolean; state?: unknown }) => void];
export function useSubmit(): (target: any, opts?: any) => void;
export function useLoaderData<T = unknown>(): T;
export function useActionData<T = unknown>(): T;
export function useRouteError(): unknown;
export function useRouteLoaderData<S = unknown>(routeId: string): S | undefined;
export function useMatches(): any[];
export function useFetcher(): any;
export function useFetchers(): any[];
export function useBeforeUnload(callback: (event: BeforeUnloadEvent) => void): void;
export function useBlocker(): any;
export function useInRouterContext(): boolean;
export function useHref(to: string | Partial<Path>): string;
export function useLinkClickHandler(to: string | Partial<Path>, opts?: { replace?: boolean; state?: unknown }): (e: any) => void;
export function useResolvedPath(to: string | Partial<Path>): Path;
export function useRevalidator(): { revalidate: () => void; state: string };
export function useFormAction(action?: string): string;

export function RouterProvider(props: { router: any; fallbackElement?: ReactNode }): ReactNode;
export function RouterProviderProps(props: any): any;
export function BrowserRouter(props: { children?: ReactNode; future?: any; window?: Window }): ReactNode;
export function HashRouter(props: { children?: ReactNode; future?: any; window?: Window }): ReactNode;
export function MemoryRouter(props: { initialEntries?: string[]; initialIndex?: number; children?: ReactNode; future?: any }): ReactNode;
export function Routes(props: { children?: ReactNode; location?: string | Partial<Path> }): ReactNode;
export function Route(props: { caseSensitive?: boolean; children?: ReactNode; element?: ReactNode; index?: boolean; path?: string }): ReactNode;
export function Navigate(props: { replace?: boolean; state?: unknown; to: string | Partial<Path> }): ReactNode;
export function Link(props: any): ReactNode;
export function NavLink(props: any): ReactNode;
export function Outlet(props: { context?: any }): ReactNode;
export function ScrollRestoration(props: any): ReactNode;
export function Form(props: any): ReactNode;
export function Meta(props: any): ReactNode;
export function Links(props: any): ReactNode;
export function Scripts(props: any): ReactNode;
export function Await(props: { resolve: Promise<unknown>; children: (value: unknown) => ReactNode }): ReactNode;

export function redirect(to: string | Partial<Path>, init?: { status?: number; headers?: Headers }): Response;
export function redirectDocument(to: string | Partial<Path>, init?: { status?: number; headers?: Headers }): Response;
export function isRouteErrorResponse(error: unknown): boolean;
export function createContext(parentContext?: unknown): { Provider: ComponentType<{ children: ReactNode; value?: any }> };
export function createPath(path: Partial<Path>): Path;
export function createSearchParams(init?: string | Record<string, string | number>): URLSearchParams;
export function data(value: unknown): { data: unknown };
export function defer(data: Record<string, unknown>): Response;
export function json(data: unknown, init?: ResponseInit): Response;
export function createCookie(name: string, opts?: any): any;
export function isCookie(value: unknown): boolean;
export function createSession(data?: Record<string, unknown>): { id: string; data: Record<string, unknown> };
export function createCookieSessionStorage(opts: any): any;
export function createMemorySessionStorage(opts: any): any;
export function isSession(value: unknown): boolean;
export function createStaticHandler(routes: RouteObject[]): any;
export function createRequestHandler(staticHandler: any, action?: boolean): any;
export function createRoutesStub(routes: any[]): any[];
export function matchPath<S>(path: string, pattern: string | { path: string; caseSensitive?: boolean; end?: boolean }): { params: Params; pathname: string; pathnameBase: string; pattern: string } | null;
export function href(to: string | Partial<Path>, base?: string): string;
export function renderMatches(matches: any[]): ReactNode;
export function replace(to: string | Partial<Path>): Response;
export function resolvePath(to: string | Partial<Path>, fromPath?: string): Path;

export const NavigationType: { Pop: number; Push: number; Replace: number };
export const UNINITIALIZED: string;
export const IDLE_BLOCKER: string;
export const IDLE_FETCHER: string;
export const IDLE_NAVIGATION: string;

export const UNSAFE_DataRouterContextProvider: any;
export const UNSAFE_DataRouterStateContextProvider: any;
export const UNSAFE_ErrorResponseImpl: any;
export const UNSAFE_FetchersContextProvider: any;
export const UNSAFE_FrameworkContext: any;
export const UNSAFE_LocationContextProvider: any;
export const UNSAFE_NavigationContextProvider: any;
export const UNSAFE_RSCDefaultRootErrorBoundary: any;
export const UNSAFE_RemixErrorBoundary: any;
export const UNSAFE_RouteContextProvider: any;
export const UNSAFE_ServerMode: any;
export const UNSAFE_SingleFetchRedirectSymbol: any;
export const UNSAFE_ViewTransitionContext: any;
export const UNSAFE_WithComponentProps: any;
export const UNSAFE_WithErrorBoundaryProps: any;
export const UNSAFE_WithHydrateFallbackProps: any;
export const UNSAFE_decodeViaTurboStream: any;
export const UNSAFE_getHydrationData: any;
export const UNSAFE_getPatchRoutesOnNavigationFunction: any;
export const UNSAFE_getTurboStreamSingleFetchDataStrategy: any;
export const UNSAFE_hydrationRouteProperties: any;
export const UNSAFE_invariant: any;
export const UNSAFE_mapRouteProperties: any;
export const UNSAFE_shouldHydrateRouteLoader: any;
export const UNSAFE_useFogOFWarDiscovery: any;
export const UNSAFE_useScrollRestoration: any;
export const UNSAFE_withComponentProps: any;
export const UNSAFE_withErrorBoundaryProps: any;
export const UNSAFE_withHydrateFallbackProps: any;
export const UNSAFE_AwaitContextProvider: any;

export const createBrowserHistory: any;
export const createHashHistory: any;
export const createMemoryHistory: any;
export const createRouter: any;

export const unstable_usePrompt: any;
export const unstable_useRoute: any;
export const unstable_useRouterState: any;
export const unstable_RSCStaticRouter: any;
export const unstable_HistoryRouter: any;
export const unstable_routeRSCServerRequest: any;
export const unstable_setDevServerHooks: any;

export const reactRouterVersion: string;
