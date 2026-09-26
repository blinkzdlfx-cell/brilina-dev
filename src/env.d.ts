/// <reference types="@cloudflare/workers-types" />

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'react-router-dom' {
  export * from 'react-router';
  export { HydratedRouter, RouterProvider, RouterProviderProps } from 'react-router/dom';
}

declare module 'motion/react' {
  import { ComponentType, ReactNode } from 'react';
  export function motion<T extends keyof JSX.IntrinsicElements>(tag: T): ComponentType<JSX.IntrinsicElements[T]>;
  namespace motion {
    export function div(props: any): any;
    export function span(props: any): any;
    export function section(props: any): any;
    export function h1(props: any): any;
    export function h2(props: any): any;
    export function h3(props: any): any;
    export function p(props: any): any;
    export function img(props: any): any;
    export function a(props: any): any;
    export function button(props: any): any;
    export function form(props: any): any;
    export function input(props: any): any;
    export function textarea(props: any): any;
    export function ul(props: any): any;
    export function li(props: any): any;
    export function nav(props: any): any;
    export function header(props: any): any;
    export function footer(props: any): any;
    export function main(props: any): any;
    export function aside(props: any): any;
    export function table(props: any): any;
    export function tr(props: any): any;
    export function td(props: any): any;
    export function th(props: any): any;
    export function figure(props: any): any;
    export function figcaption(props: any): any;
    export function svg(props: any): any;
  }
  export function AnimatePresence(props: { children?: ReactNode; mode?: 'sync' | 'popLayout' | 'wait'; initial?: boolean }): ReactNode;
  export function useInView(ref: { current: HTMLElement | null }, opts?: { once?: boolean; margin?: string }): boolean;
  export function useReducedMotion(): boolean | null;
  export function usePageInView(): boolean;
  export function useReducedMotionConfig(): { reduceMotion: boolean };
  export function inView(element: HTMLElement, callback: (entry: IntersectionObserverEntry) => void, opts?: { once?: boolean; margin?: string }): () => void;
  export const prefersReducedMotion: { current: boolean | null };
  export const hasReducedMotionListener: boolean;
  export function initPrefersReducedMotion(): void;
  export function delay(fn: () => void, ms: number): void;
}
