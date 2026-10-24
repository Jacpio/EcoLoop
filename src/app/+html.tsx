import {
  ScrollViewStyleReset,
  useServerDocumentContext,
} from "expo-router/html";
import type { PropsWithChildren } from "react";
export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } =
    useServerDocumentContext();
  return (
    <html {...htmlAttributes} lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#F7F4ED" />
        <meta
          name="description"
          content="EcoLoop — znajdź punkt zwrotu opakowań i umów sąsiedzki odbiór. Dobry obieg zaczyna się blisko."
        />
        <title>EcoLoop — dobry obieg zaczyna się blisko</title>
        <ScrollViewStyleReset />
        <style>{`body { background: #F7F4ED; } * { scrollbar-width: thin; scrollbar-color: #D4C4B4 transparent; } input:focus, textarea:focus { outline: 2px solid #793E4B; outline-offset: -2px; } :focus-visible { outline: 2px solid #793E4B; outline-offset: 3px; }`}</style>
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
